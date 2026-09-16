import type { ReactNode } from 'react'

import { useUnistyles } from 'react-native-unistyles'

/**
 * Web has no tab bar drawn over the toast overlay (`_layout.web.tsx` renders a
 * top navbar), so toasts need no offset. See `toastInsets.tsx` for the native
 * implementation this stands in for.
 */
export function ToastInsetProvider({ children }: { children: ReactNode }) {
  return children
}

export function useSetToastBottomInset() {
  return () => {}
}

export function useToastContainerStyle() {
  const { theme } = useUnistyles()
  return { marginBottom: theme.gap(3) }
}
