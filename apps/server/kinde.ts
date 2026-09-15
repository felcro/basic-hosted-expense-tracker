import {
  createKindeServerClient,
  GrantType,
  type SessionManager,
  type UserType,
} from '@kinde-oss/kinde-typescript-sdk'
import { jwtDecoder } from '@kinde/jwt-decoder'
import { validateToken } from '@kinde/jwt-validator'
import { type Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

export const kindeClient = createKindeServerClient(
  GrantType.AUTHORIZATION_CODE,
  {
    authDomain: process.env.KINDE_DOMAIN!,
    clientId: process.env.KINDE_CLIENT_ID!,
    clientSecret: process.env.KINDE_CLIENT_SECRET,
    redirectURL: process.env.KINDE_REDIRECT_URI!,
    logoutRedirectURL: process.env.KINDE_LOGOUT_REDIRECT_URI,
  },
)

export const sessionManager = (c: Context): SessionManager => ({
  async getSessionItem(key: string) {
    const result = getCookie(c, key)
    return result
  },
  async setSessionItem(key: string, value: unknown) {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: process.env['COOKIE_SAME_SITE'] === 'None' ? 'None' : 'Lax',
    } as const
    if (typeof value === 'string') {
      setCookie(c, key, value, cookieOptions)
    } else {
      setCookie(c, key, JSON.stringify(value), cookieOptions)
    }
  },
  async removeSessionItem(key: string) {
    deleteCookie(c, key)
  },
  async destroySession() {
    ;['id_token', 'access_token', 'refresh_token'].forEach((key) => {
      deleteCookie(c, key)
    })
  },
})

type Env = {
  Variables: {
    user: UserType
  }
}

const kindeDomain = process.env.KINDE_DOMAIN!
const apiAudience = process.env.KINDE_API_AUDIENCE

/**
 * Native clients authenticate with a Kinde access token in the Authorization
 * header rather than a session cookie — the auth browser sheet's cookie jar is
 * not the app's, so a cookie set during login never reaches the app's fetch.
 *
 * Returns a `UserType` built from the token's claims, or null if the header is
 * absent or the token fails verification. Only `id` is populated: an access
 * token carries authorization claims, not identity ones (email and name live on
 * the id token, which stays on the device). `/api/me` reports the rest as null.
 */
async function userFromBearerToken(c: Context): Promise<UserType | null> {
  const header = c.req.header('Authorization')
  const token = header?.match(/^Bearer (.+)$/)?.[1]
  if (!token) {
    return null
  }

  // Verifies the RS256 signature against the domain's JWKS. Note this checks
  // the signature only — not expiry, issuer or audience, which are checked below.
  const { valid } = await validateToken({ token, domain: kindeDomain })
  if (!valid) {
    return null
  }

  const claims = jwtDecoder<{
    sub?: string
    iss?: string
    aud?: Array<string>
    exp?: number
  }>(token)

  // Signature alone only proves Kinde issued this token, not that it was issued
  // for us, nor that it is still current: `validateToken` above checks the
  // signature and nothing else, so expiry, issuer and audience are all checked
  // here. Without the `exp` check a leaked token would be accepted forever.
  if (!claims?.sub || claims.iss !== kindeDomain) {
    return null
  }
  if (!claims.exp || claims.exp * 1000 <= Date.now()) {
    return null
  }
  if (apiAudience && !claims.aud?.includes(apiAudience)) {
    return null
  }

  return {
    id: claims.sub,
    email: '',
    given_name: '',
    family_name: '',
    picture: null,
    phone: '',
  }
}

export const getUser = createMiddleware<Env>(async (c, next) => {
  try {
    const bearerUser = await userFromBearerToken(c)
    if (bearerUser) {
      c.set('user', bearerUser)
      await next()
      return
    }

    // No usable bearer token — fall back to the cookie session used by web.
    const manager = sessionManager(c)
    const isAuthenticated = await kindeClient.isAuthenticated(manager)

    if (!isAuthenticated) {
      return c.json({ error: 'Unauthorised' }, 401)
    }

    const user = await kindeClient.getUserProfile(manager)
    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Unauthorised ' }, 401)
  }
})
