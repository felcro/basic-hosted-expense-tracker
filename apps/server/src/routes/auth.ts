import { Hono, type Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { getUser, kindeClient, sessionManager } from '../../kinde'

const appRedirectCookie = 'post_login_redirect'
const appScheme = 'expenseapp://'

function storeAppRedirect(c: Context) {
  const appRedirect = c.req.query('app_redirect')
  if (appRedirect?.startsWith(appScheme)) {
    setCookie(c, appRedirectCookie, appRedirect, { httpOnly: true })
  }
}

export const authRoute = new Hono()
  .get('/login', async (c) => {
    storeAppRedirect(c)
    const loginUrl = await kindeClient.login(sessionManager(c))
    return c.redirect(loginUrl.toString())
  })
  .get('/register', async (c) => {
    storeAppRedirect(c)
    const registerUrl = await kindeClient.register(sessionManager(c))
    return c.redirect(registerUrl.toString())
  })
  .get('/callback', async (c) => {
    // get called every time we login or register
    const url = new URL(c.req.url)
    await kindeClient.handleRedirectToApp(sessionManager(c), url)
    const appRedirect = getCookie(c, appRedirectCookie)
    deleteCookie(c, appRedirectCookie)
    const webRedirect = process.env['APP_URL'] ?? '/'
    return c.redirect(appRedirect ?? webRedirect)
  })
  .get('/logout', async (c) => {
    const logoutUrl = await kindeClient.logout(sessionManager(c))
    return c.redirect(logoutUrl.toString())
  })
  .get('/me', getUser, async (c) => {
    const user = c.var.user
    return c.json({ user })
  })
