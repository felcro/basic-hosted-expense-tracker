import type { ReactNode } from 'react'

import { createContext, useContext, useMemo, useState } from 'react'

/**
 * The tab bar is drawn over the toast overlay on native, so a bottom-placed
 * toast lands on top of it. The bar's height isn't fixed (it varies with the
 * safe-area inset), so it's measured at render and published here rather than
 * hardcoded. Web has no tab bar over the overlay (`_layout.web.tsx` renders a
 * top navbar), so `toastInsets.web.tsx` keeps this at 0 and toasts stay put.
 */
const ToastBottomInsetContext = createContext<{
  bottomInset: number
  setBottomInset: (height: number) => void
}>({ bottomInset: 0, setBottomInset: () => {} })

export function ToastInsetProvider({ children }: { children: ReactNode }) {
  const [bottomInset, setBottomInset] = useState(0)

  const value = useMemo(() => ({ bottomInset, setBottomInset }), [bottomInset])

  return (
    <ToastBottomInsetContext.Provider value={value}>
      {children}
    </ToastBottomInsetContext.Provider>
  )
}

export function useSetToastBottomInset() {
  return useContext(ToastBottomInsetContext).setBottomInset
}

/**
 * Pass as `containerStyle` to `toast.show()`. gluestack applies it to the
 * wrapper view around the toast, so this lifts the toast clear of the tab bar
 * without adding padding to the toast itself.
 */
export function useToastContainerStyle() {
  const { bottomInset } = useContext(ToastBottomInsetContext)

  return useMemo(
    () => (bottomInset > 0 ? { marginBottom: bottomInset } : undefined),
    [bottomInset],
  )
}
