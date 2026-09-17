// Stubs the auth boundary — the ONLY thing integration tests mock. Everything
// below it (Hono routing, Drizzle, SQL, the real schema) runs for real.
//
// Token verification is test-auth-writer's territory; here we only need "a
// known user is signed in", plus the ability to switch users so ownership
// isolation can be proven with two real tenants.
import { mock } from 'bun:test'

export const USER_A = 'test_user_a'
export const USER_B = 'test_user_b'

let currentUser: string | null = USER_A

/** Act as this user for subsequent requests. */
export function actAs(userId: string) {
  currentUser = userId
}

/** Act as nobody — the middleware then answers 401, as it does for a real
 *  unauthenticated request. */
export function actAsSignedOut() {
  currentUser = null
}

/**
 * Replaces `getUser` in apps/server/kinde.ts.
 *
 * Must be called before the module under test is imported, so import the route
 * or server module dynamically in the test file after calling this.
 */
export function stubAuth() {
  mock.module(require.resolve('../../kinde'), () => ({
    getUser: async (
      c: {
        set: (k: string, v: unknown) => void
        json: (b: unknown, s?: number) => Response
      },
      next: () => Promise<void>,
    ) => {
      if (!currentUser) {
        return c.json({ error: 'Unauthorised' }, 401)
      }
      c.set('user', {
        id: currentUser,
        email: '',
        given_name: '',
        family_name: '',
        picture: null,
        phone: '',
      })
      await next()
    },
    // Re-exported so importing modules that reference these do not break.
    kindeClient: {},
    sessionManager: () => ({}),
  }))
}
