import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, GraduationCap, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NAV } from '../../config/nav.js'
import { CURRENT_USER } from '../../data/mockData.js'
import { useApp } from '../../context/AppContext.jsx'

/** Which collapsible section (if any) contains the active route. */
function sectionForPath(pathname) {
  return NAV.find((item) => item.basePath && pathname.startsWith(item.basePath))?.id ?? null
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, setMobileNavOpen } = useApp()

  // Accordion: the section holding the current route opens itself on navigation.
  const [openSection, setOpenSection] = useState(() => sectionForPath(pathname))

  useEffect(() => {
    const active = sectionForPath(pathname)
    if (active) setOpenSection(active)
  }, [pathname])

  // A collapsed rail has no room for sub-menus, so flyouts are out of scope —
  // expanding the rail is what reveals them again.
  const collapsed = sidebarCollapsed

  const leafClasses = ({ isActive }) =>
    [
      'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
      isActive
        ? 'bg-brand-500/10 text-brand-800'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
    ].join(' ')

  return (
    <>
      {/* Scrim for the mobile drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-neutral-200 bg-white transition-[width,transform] duration-200 ease-out',
          'lg:static lg:translate-x-0',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-[72px]' : 'w-[264px]',
        ].join(' ')}
        aria-label="Main navigation"
      >
        {/* ------------------------------ Brand ------------------------------ */}
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-neutral-200 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500 text-white shadow-sm">
            <GraduationCap size={20} strokeWidth={2.25} aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-tight font-bold tracking-tight text-neutral-900">
                iCAMPUS
              </p>
              <p className="truncate text-[11px] text-neutral-500">Learning Management</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="-mr-1 rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* --------------------------- User profile -------------------------- */}
        <div className={`flex shrink-0 items-center gap-3 border-b border-neutral-200 px-4 py-3.5 ${collapsed ? 'justify-center px-2' : ''}`}>
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-[12.5px] font-semibold text-white">
            {CURRENT_USER.initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-semibold text-neutral-900">{CURRENT_USER.name}</p>
              <p className="truncate text-[11.5px] text-neutral-500">{CURRENT_USER.role}</p>
            </div>
          )}
        </div>

        {/* ------------------------------ Nav -------------------------------- */}
        <nav className="thin-scroll flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
          {NAV.map((item) => {
            const Icon = item.icon

            if (!item.children) {
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={leafClasses}
                  onClick={() => setMobileNavOpen(false)}
                  title={collapsed ? item.label : undefined}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-brand-500" aria-hidden="true" />
                      )}
                      <Icon size={18} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              )
            }

            const sectionActive = pathname.startsWith(item.basePath)
            const expanded = !collapsed && openSection === item.id

            return (
              <div key={item.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  title={collapsed ? item.label : undefined}
                  onClick={() =>
                    collapsed
                      ? toggleSidebar()
                      : setOpenSection((cur) => (cur === item.id ? null : item.id))
                  }
                  className={[
                    'relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition-colors',
                    sectionActive
                      ? 'text-brand-800'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-neutral-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </button>

                {expanded && (
                  <div className="mt-0.5 ml-[26px] space-y-0.5 border-l border-neutral-200 pl-2.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={() => setMobileNavOpen(false)}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13px] transition-colors',
                            isActive
                              ? 'bg-brand-500/10 font-medium text-brand-800'
                              : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
                          ].join(' ')
                        }
                      >
                        <child.icon size={15} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ---------------------------- Collapse ----------------------------- */}
        <div className="shrink-0 border-t border-neutral-200 p-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
