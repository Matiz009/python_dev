import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell, ChevronRight, KeyRound, LogOut, Maximize2, Menu, Minimize2, Search, User,
} from 'lucide-react'
import { breadcrumbsFor, FLAT_ROUTES } from '../../config/nav.js'
import { CURRENT_USER } from '../../data/mockData.js'
import { useApp } from '../../context/AppContext.jsx'

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const {
    setMobileNavOpen, globalSearch, setGlobalSearch,
    isFullscreen, toggleFullscreen, notify,
  } = useApp()

  const [menuOpen, setMenuOpen] = useState(false)
  const [resultsOpen, setResultsOpen] = useState(false)
  const menuRef = useRef(null)
  const searchRef = useRef(null)

  const crumbs = breadcrumbsFor(pathname)

  const matches = globalSearch.trim()
    ? FLAT_ROUTES.filter((r) =>
        `${r.parent ?? ''} ${r.label}`.toLowerCase().includes(globalSearch.trim().toLowerCase())
      ).slice(0, 6)
    : []

  // Close the profile menu and the search results on any outside click.
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setResultsOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  // Ctrl/Cmd-K focuses global search, the way every other admin console does.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchRef.current?.querySelector('input')?.focus()
      }
      if (e.key === 'Escape') setResultsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const goTo = (path) => {
    setGlobalSearch('')
    setResultsOpen(false)
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="-ml-1 rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* ---------------------------- Breadcrumbs --------------------------- */}
        <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
          <ol className="flex items-center gap-1.5 text-[13px]">
            <li>
              <Link to="/dashboard" className="text-neutral-500 transition-colors hover:text-neutral-900">
                Home
              </Link>
            </li>
            {crumbs.map((crumb, i) => (
              <li key={crumb} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-neutral-300" aria-hidden="true" />
                <span
                  className={
                    i === crumbs.length - 1
                      ? 'font-medium text-neutral-900'
                      : 'text-neutral-500'
                  }
                  aria-current={i === crumbs.length - 1 ? 'page' : undefined}
                >
                  {crumb}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {/* -------------------------- Global search --------------------------- */}
        <div ref={searchRef} className="relative ml-auto w-full max-w-xs sm:max-w-sm">
          <Search
            size={15}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value)
              setResultsOpen(true)
            }}
            onFocus={() => setResultsOpen(true)}
            placeholder="Search modules, batches, students…"
            aria-label="Global search"
            className="h-9.5 w-full rounded-lg border border-neutral-300 bg-neutral-50 pr-12 pl-9 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-neutral-300 bg-white px-1.5 py-0.5 text-[10.5px] font-medium text-neutral-500 sm:block">
            ⌘K
          </kbd>

          {resultsOpen && globalSearch.trim() && (
            <div className="absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              {matches.length ? (
                <ul className="max-h-72 overflow-y-auto py-1">
                  {matches.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => goTo(m.path)}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-neutral-50"
                      >
                        <m.icon size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                        <span className="truncate text-neutral-800">{m.label}</span>
                        {m.parent && (
                          <span className="ml-auto shrink-0 text-[11.5px] text-neutral-400">{m.parent}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-4 text-center text-[13px] text-neutral-500">
                  No modules match “{globalSearch}”.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ----------------------------- Actions ------------------------------ */}
        <button
          type="button"
          onClick={() => notify('You have 3 unread notifications.', 'info')}
          className="relative hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 sm:block"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="hidden rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100 sm:block"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>

        {/* -------------------------- Profile menu ---------------------------- */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-neutral-100"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-900 text-[12px] font-semibold text-white">
              {CURRENT_USER.initials}
            </span>
            <span className="hidden text-[13.5px] font-medium text-neutral-800 sm:block">
              {CURRENT_USER.name}
            </span>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
            >
              <div className="border-b border-neutral-200 px-4 py-3">
                <p className="truncate text-[13.5px] font-semibold text-neutral-900">{CURRENT_USER.fullName}</p>
                <p className="truncate text-[12px] text-neutral-500">{CURRENT_USER.email}</p>
              </div>
              <div className="py-1">
                {[
                  { label: 'Profile', icon: User, to: '/profile' },
                  { label: 'Change Password', icon: KeyRound, to: '/change-password' },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    <item.icon size={15} className="text-neutral-400" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-neutral-200 py-1">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    notify('Signed out of this demo session.', 'info')
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-[13px] text-red-700 transition-colors hover:bg-red-50"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
