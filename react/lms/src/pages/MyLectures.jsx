import { useState } from 'react'
import { CalendarPlus, DoorOpen, Radio, Users, Video, XCircle } from 'lucide-react'
import { Badge, Button, Card, PageHeader, StatusBadge, Tabs } from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, MY_LECTURES } from '../data/mockData.js'

export default function MyLectures() {
  const { notify } = useApp()
  const [rows, setRows] = useState(MY_LECTURES)
  const [tab, setTab] = useState('all')
  const [batch, setBatch] = useState('')
  const [mode, setMode] = useState('')

  const tabs = [
    { id: 'all', label: 'All', count: rows.length },
    { id: 'Scheduled', label: 'Scheduled', count: rows.filter((r) => r.status === 'Scheduled').length },
    { id: 'Delivered', label: 'Delivered', count: rows.filter((r) => r.status === 'Delivered').length },
    { id: 'Cancelled', label: 'Cancelled', count: rows.filter((r) => r.status === 'Cancelled').length },
  ]

  const filtered = rows.filter(
    (r) =>
      (tab === 'all' || r.status === tab) &&
      (!batch || r.batch === batch) &&
      (!mode || r.mode === mode)
  )

  const cancel = (row) => {
    setRows((list) => list.map((r) => (r.id === row.id ? { ...r, status: 'Cancelled' } : r)))
    notify(`“${row.title}” cancelled — the batch has been notified.`, 'info')
  }

  const columns = [
    {
      key: 'title',
      header: 'Lecture',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{r.title}</p>
          <p className="truncate text-[12px] text-neutral-500">{r.batch}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'When',
      sortable: true,
      render: (r) => (
        <div className="tnum">
          <p className="text-neutral-900">{r.date}</p>
          <p className="text-[12px] text-neutral-500">{r.time}</p>
        </div>
      ),
    },
    {
      key: 'mode',
      header: 'Mode',
      sortable: true,
      render: (r) => (
        <Badge tone={r.mode === 'Online' ? 'info' : 'neutral'} icon={r.mode === 'Online' ? Radio : DoorOpen}>
          {r.mode}
        </Badge>
      ),
    },
    {
      key: 'room',
      header: 'Room',
      render: (r) => <span className="text-neutral-600">{r.room}</span>,
    },
    {
      key: 'attendees',
      header: 'Attendees',
      sortable: true,
      align: 'right',
      render: (r) =>
        r.attendees ? (
          <span className="tnum inline-flex items-center gap-1.5 text-neutral-900">
            <Users size={13} className="text-neutral-400" aria-hidden="true" />
            {r.attendees}
          </span>
        ) : (
          <span className="text-neutral-400">—</span>
        ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="My lectures"
        subtitle="Every session assigned to you, past and upcoming."
        actions={
          <Button variant="primary" icon={CalendarPlus} onClick={() => notify('Lecture request submitted for approval.', 'info')}>
            Request slot
          </Button>
        }
      />

      <div className="mb-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['title', 'batch', 'room']}
        searchPlaceholder="Search lectures…"
        filters={[
          { key: 'batch', label: 'Batch', options: BATCHES, value: batch, onChange: setBatch },
          { key: 'mode', label: 'Mode', options: ['Physical', 'Online'], value: mode, onChange: setMode },
        ]}
        actions={(row) => [
          { label: 'Start session', icon: Video, onSelect: () => notify(`Starting “${row.title}”.`, 'info') },
          { label: 'View roster', icon: Users, onSelect: () => notify(`Roster for ${row.batch} opened.`, 'info') },
          { label: 'Cancel lecture', icon: XCircle, tone: 'danger', onSelect: () => cancel(row) },
        ]}
        emptyTitle="No lectures here"
        emptyMessage="Nothing matches this tab and filter combination."
      />
    </>
  )
}
