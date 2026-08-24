import { useState } from 'react'
import { Clock, Mail, UserRoundCheck, UserRoundX } from 'lucide-react'
import {
  Badge, Button, Card, Field, Modal, PageHeader, Select,
} from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, SUBJECTS, UNMATCHED_PARTICIPANTS } from '../data/mockData.js'

const SLOTS = ['Morning', 'Afternoon', 'Evening', 'Weekend']
const CAMPUSES = ['Lahore', 'Karachi', 'Islamabad']

export default function UnmatchedParticipants() {
  const { notify } = useApp()
  const [rows, setRows] = useState(UNMATCHED_PARTICIPANTS)
  const [slot, setSlot] = useState('')
  const [campus, setCampus] = useState('')
  const [subject, setSubject] = useState('')

  const [matching, setMatching] = useState(null)
  const [targetBatch, setTargetBatch] = useState(BATCHES[0])

  const filtered = rows.filter(
    (p) =>
      (!slot || p.preferredSlot === slot) &&
      (!campus || p.campus === campus) &&
      (!subject || p.preferredSubject === subject)
  )

  const longestWait = rows.reduce((max, p) => Math.max(max, p.waitingDays), 0)

  const confirmMatch = () => {
    setRows((list) => list.filter((p) => p.id !== matching.id))
    notify(`${matching.name} matched into ${targetBatch}.`)
    setMatching(null)
  }

  const columns = [
    {
      key: 'name',
      header: 'Participant',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{r.name}</p>
          <p className="tnum truncate text-[12px] text-neutral-500">{r.id}</p>
        </div>
      ),
    },
    { key: 'preferredSubject', header: 'Preferred programme', sortable: true },
    {
      key: 'preferredSlot',
      header: 'Preferred slot',
      sortable: true,
      render: (r) => <Badge tone="neutral">{r.preferredSlot}</Badge>,
    },
    { key: 'campus', header: 'Campus', sortable: true },
    { key: 'reason', header: 'Blocked by' },
    {
      key: 'waitingDays',
      header: 'Waiting',
      sortable: true,
      align: 'right',
      render: (r) => (
        <span
          className={`tnum inline-flex items-center gap-1.5 font-medium ${
            r.waitingDays > 20 ? 'text-red-700' : 'text-neutral-700'
          }`}
        >
          <Clock size={13} aria-hidden="true" />
          {r.waitingDays}d
        </span>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Unmatched participants"
        subtitle="Candidates awaiting a batch placement — match them manually or hold for the next intake."
        actions={
          <Button icon={Mail} onClick={() => notify(`Update emailed to ${filtered.length} participants.`)}>
            Notify all
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Awaiting placement', value: rows.length },
          { label: 'Longest wait', value: `${longestWait}d` },
          { label: 'Over 20 days', value: rows.filter((p) => p.waitingDays > 20).length },
          { label: 'Campuses affected', value: new Set(rows.map((p) => p.campus)).size },
        ].map((tile) => (
          <Card key={tile.label} className="p-3.5">
            <p className="text-[12px] font-medium text-neutral-500">{tile.label}</p>
            <p className="tnum mt-1.5 text-xl font-semibold text-neutral-900">{tile.value}</p>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['name', 'id', 'preferredSubject', 'campus', 'reason']}
        searchPlaceholder="Search participants…"
        filters={[
          { key: 'subject', label: 'Programme', options: SUBJECTS, value: subject, onChange: setSubject },
          { key: 'slot', label: 'Slot', options: SLOTS, value: slot, onChange: setSlot },
          { key: 'campus', label: 'Campus', options: CAMPUSES, value: campus, onChange: setCampus },
        ]}
        actions={(row) => [
          {
            label: 'Match to batch',
            icon: UserRoundCheck,
            onSelect: () => {
              setMatching(row)
              setTargetBatch(BATCHES[0])
            },
          },
          { label: 'Email participant', icon: Mail, onSelect: () => notify(`Draft opened for ${row.name}.`, 'info') },
          {
            label: 'Remove from queue',
            icon: UserRoundX,
            tone: 'danger',
            onSelect: () => {
              setRows((list) => list.filter((p) => p.id !== row.id))
              notify(`${row.name} removed from the queue.`, 'info')
            },
          },
        ]}
        emptyTitle="Everyone is placed"
        emptyMessage="No participants match these filters — the queue is clear."
      />

      <Modal
        open={Boolean(matching)}
        onClose={() => setMatching(null)}
        size="sm"
        title="Match participant to a batch"
        description={matching ? `${matching.name} · prefers ${matching.preferredSlot.toLowerCase()} sessions` : ''}
        footer={
          <>
            <Button onClick={() => setMatching(null)}>Cancel</Button>
            <Button variant="primary" onClick={confirmMatch}>Confirm match</Button>
          </>
        }
      >
        {matching && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 rounded-lg bg-neutral-50 p-3.5 text-[13px]">
              <div>
                <dt className="text-[12px] text-neutral-500">Programme</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{matching.preferredSubject}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-neutral-500">Campus</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{matching.campus}</dd>
              </div>
              <div>
                <dt className="text-[12px] text-neutral-500">Waiting</dt>
                <dd className="tnum mt-0.5 font-medium text-neutral-900">{matching.waitingDays} days</dd>
              </div>
              <div>
                <dt className="text-[12px] text-neutral-500">Blocked by</dt>
                <dd className="mt-0.5 font-medium text-neutral-900">{matching.reason}</dd>
              </div>
            </dl>

            <Field label="Target batch" htmlFor="up-batch">
              <Select id="up-batch" value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
