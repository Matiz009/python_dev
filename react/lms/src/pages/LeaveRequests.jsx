import { useState } from 'react'
import { CalendarOff, Eye, Plus, Send, Trash2 } from 'lucide-react'
import {
  Badge, Button, Card, CardHeader, Field, Input, Modal, PageHeader,
  ProgressBar, Select, StatusBadge, Textarea,
} from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { LEAVE_BALANCE, LEAVE_REQUESTS } from '../data/mockData.js'

const LEAVE_TYPES = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Short Leave']

const BLANK = { type: LEAVE_TYPES[0], from: '', to: '', reason: '', handover: '' }

/** Inclusive whole-day count between two ISO dates. */
function dayCount(from, to) {
  if (!from || !to) return 0
  const ms = new Date(to) - new Date(from)
  return ms < 0 ? 0 : Math.round(ms / 86400000) + 1
}

export default function LeaveRequests() {
  const { notify } = useApp()
  const [rows, setRows] = useState(LEAVE_REQUESTS)
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const days = dayCount(form.from, form.to)

  const submit = (e) => {
    e.preventDefault()
    if (!form.from || !form.to) {
      notify('Pick both a start and an end date.', 'info')
      return
    }
    if (new Date(form.to) < new Date(form.from)) {
      notify('The end date cannot fall before the start date.', 'info')
      return
    }
    if (!form.reason.trim()) {
      notify('A short reason is required for the approver.', 'info')
      return
    }

    const nextId = `LV-${String(19 + rows.length - LEAVE_REQUESTS.length).padStart(3, '0')}`
    setRows((list) => [
      {
        ...form,
        id: nextId,
        days,
        status: 'Pending',
        applied: new Date().toISOString().slice(0, 10),
        approver: 'Head of Faculty',
      },
      ...list,
    ])
    notify(`${form.type} request submitted for approval.`)
    setModalOpen(false)
    setForm(BLANK)
  }

  const filtered = rows.filter(
    (r) => (!status || r.status === status) && (!type || r.type === type)
  )

  const columns = [
    { key: 'id', header: 'Request', sortable: true, render: (r) => <span className="tnum font-medium text-neutral-900">{r.id}</span> },
    { key: 'type', header: 'Type', sortable: true, render: (r) => <Badge tone="neutral">{r.type}</Badge> },
    {
      key: 'from',
      header: 'Period',
      sortable: true,
      render: (r) => (
        <span className="tnum text-neutral-600">
          {r.from} → {r.to}
        </span>
      ),
    },
    { key: 'days', header: 'Days', sortable: true, align: 'right', render: (r) => <span className="tnum">{r.days}</span> },
    {
      key: 'reason',
      header: 'Reason',
      className: 'max-w-[240px]',
      render: (r) => <span className="block truncate text-neutral-600">{r.reason}</span>,
    },
    { key: 'applied', header: 'Applied', sortable: true, render: (r) => <span className="tnum text-neutral-500">{r.applied}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Leave requests"
        subtitle="Submit time off and track where each request sits in approval."
        actions={<Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Request leave</Button>}
      />

      {/* ------------------------------ Balances ------------------------------ */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {LEAVE_BALANCE.map((b) => {
          const remaining = b.total - b.used
          return (
            <Card key={b.type} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-medium text-neutral-700">{b.type}</p>
                <CalendarOff size={15} className="text-neutral-400" aria-hidden="true" />
              </div>
              <p className="tnum mt-2 text-xl font-semibold text-neutral-900">
                {remaining}
                <span className="ml-1 text-[13px] font-normal text-neutral-500">of {b.total} days left</span>
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={(b.used / b.total) * 100}
                  label={`${b.type} used`}
                  tone={remaining <= 2 ? 'critical' : remaining <= 5 ? 'warning' : 'brand'}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {/* --------------------------- Status history --------------------------- */}
      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['id', 'type', 'reason']}
        searchPlaceholder="Search requests…"
        filters={[
          { key: 'type', label: 'Type', options: LEAVE_TYPES, value: type, onChange: setType },
          { key: 'status', label: 'Status', options: ['Pending', 'Approved', 'Rejected'], value: status, onChange: setStatus },
        ]}
        actions={(row) => [
          { label: 'View details', icon: Eye, onSelect: () => notify(`${row.id}: ${row.reason}`, 'info') },
          ...(row.status === 'Pending'
            ? [{
                label: 'Withdraw',
                icon: Trash2,
                tone: 'danger',
                onSelect: () => {
                  setRows((list) => list.filter((r) => r.id !== row.id))
                  notify(`${row.id} withdrawn.`, 'info')
                },
              }]
            : []),
        ]}
        emptyTitle="No leave requests"
        emptyMessage="Submit a request or clear the active filters."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Request leave"
        description="Requests route to your reporting line for approval."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" icon={Send} onClick={submit}>Submit request</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Leave type" htmlFor="lv-type">
            <Select id="lv-type" value={form.type} onChange={setField('type')}>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="From" htmlFor="lv-from" required>
              <Input id="lv-from" type="date" value={form.from} onChange={setField('from')} />
            </Field>
            <Field label="To" htmlFor="lv-to" required>
              <Input id="lv-to" type="date" value={form.to} onChange={setField('to')} />
            </Field>
          </div>

          {days > 0 && (
            <p className="rounded-lg bg-brand-50 px-3 py-2 text-[13px] text-brand-800">
              This request covers <span className="tnum font-semibold">{days}</span> calendar day
              {days === 1 ? '' : 's'}.
            </p>
          )}

          <Field label="Reason" htmlFor="lv-reason" required>
            <Textarea id="lv-reason" rows={3} value={form.reason} onChange={setField('reason')} placeholder="Briefly, why you need the time off." />
          </Field>

          <Field
            label="Handover notes"
            htmlFor="lv-handover"
            hint="Who covers your lectures while you are away."
          >
            <Textarea id="lv-handover" rows={2} value={form.handover} onChange={setField('handover')} placeholder="e.g. Sadia Rauf covers Batch 42-A." />
          </Field>
        </form>
      </Modal>
    </>
  )
}
