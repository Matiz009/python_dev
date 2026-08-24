import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

const clock = () =>
  new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })

export function AppProvider({ children }) {
  /* ---------------------------- Shell / chrome ---------------------------- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      /* Fullscreen can be blocked by permissions policy — keep the UI in sync below. */
    }
  }, [])

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  /* ------------------------- Campus session tracker ----------------------- */
  const [session, setSession] = useState({ checkedIn: false, checkInAt: null, checkOutAt: null })

  const checkIn = useCallback(() => {
    setSession({ checkedIn: true, checkInAt: clock(), checkOutAt: null })
  }, [])

  const checkOut = useCallback(() => {
    setSession((s) => ({ ...s, checkedIn: false, checkOutAt: clock() }))
  }, [])

  /* --------------------------------- Toasts -------------------------------- */
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message, tone = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((list) => [...list, { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3600)
  }, [])

  const value = useMemo(
    () => ({
      sidebarCollapsed, toggleSidebar, setSidebarCollapsed,
      mobileNavOpen, setMobileNavOpen,
      globalSearch, setGlobalSearch,
      isFullscreen, toggleFullscreen,
      session, checkIn, checkOut,
      toasts, notify, dismissToast,
    }),
    [
      sidebarCollapsed, toggleSidebar, mobileNavOpen, globalSearch,
      isFullscreen, toggleFullscreen, session, checkIn, checkOut,
      toasts, notify, dismissToast,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
