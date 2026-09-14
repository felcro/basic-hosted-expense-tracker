declare namespace NodeJS {
  interface ProcessEnv {
    ALLOWED_ORIGINS: string | undefined
    APP_URL: string | undefined
    KINDE_DOMAIN: string | undefined
    KINDE_CLIENT_ID: string | undefined
    KINDE_CLIENT_SECRET: string | undefined
    KINDE_REDIRECT_URI: string | undefined
    KINDE_LOGOUT_REDIRECT_URI: string | undefined
    KINDE_API_AUDIENCE: string | undefined
    COOKIE_SAME_SITE: string | undefined
    DATABASE_URL: string | undefined
  }
}
