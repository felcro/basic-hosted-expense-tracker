import { SplashScreen } from 'expo-router'
import { useEffect } from 'react'

import { useSession } from './auth'

SplashScreen.preventAutoHideAsync()

export function SplashScreenController() {
  const { isLoading } = useSession()

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hide()
    }
  }, [isLoading])

  return null
}
