declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL: string
    EXPO_PUBLIC_NATIVE_DEV_API_URL: string | undefined
    EXPO_PUBLIC_KINDE_DOMAIN: string | undefined
    EXPO_PUBLIC_KINDE_CLIENT_ID: string | undefined
    EXPO_PUBLIC_KINDE_API_AUDIENCE: string | undefined
  }
}
