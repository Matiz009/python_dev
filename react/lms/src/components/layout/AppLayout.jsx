import { Outlet } from 'react-router-dom'
import { CircleCheck, Info, X } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { useApp } from '../../context/AppContext.jsx'

function Toasts() {
  const { toasts, dismissToast } = useApp()
  if (!toasts.length) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:right-6 sm:left-auto sm:translate-x-0"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const Icon = t.tone === 'info' ? Info : CircleCheck
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-3 shadow-lg"
          >
            <Icon
              size={16}
              className={t.tone === 'info' ? 'mt-0.5 shrink-0 text-blue-600' : 'mt-0.5 shrink-0 text-brand-600'}
              aria-hidden="true"
            />
            <p className="flex-1 text-[13px] text-neutral-800">{t.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="-m-1 shrink-0 rounded p-1 text-neutral-400 hover:text-neutral-700"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="flex h-full min-h-screen bg-[var(--color-plane)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="thin-scroll flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-6">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}
