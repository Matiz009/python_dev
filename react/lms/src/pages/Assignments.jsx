import { useState } from 'react'
import { CalendarClock, Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import {
  Badge, Button, Field, Input, Modal, PageHeader, ProgressBar, Select, StatusBadge, Textarea,
} from '../components/ui/Primitives.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ASSIGNMENTS, BATCHES, SUBJECTS } from '../data/mockData.js'

const BLANK = {
  title: '', subject: SUBJECTS[0], batch: BATCHES[0],
  due: '', points: 100, instructions: '', attachment: '',
  rubric: 'Correctness 50 · Code quality 30 · Documentation 20',
  allowLate: false,
}

export default function Assignments() {
  const { notify } = useApp()
  const [rows, setRows] = useState(ASSIGNMENTS)
  const [batch, setBatch] = useState('')
  const [status, setStatus] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(BLANK)
    setModalOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ ...BLANK, ...row, instructions: row.instructions ?? '' })
    setModalOpen(true)
  }

  const save = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.due) {
      notify('Title and submission deadline are both required.', 'info')
      return
    }

    if (editing) {
      setRows((list) => list.map((r) => (r.id === editing.id ? { ...r, ...form, points: Number(form.points) } : r)))
      notify(`“${form.title}” updated.`)
    } else {
      setRows((list) => [
        {
          ...form,
          points: Number(form.points),
          id: `AS-${String(list.length + 1).padStart(2, '0')}`,
          submitted: 0,
          total: 130,
          status: 'Pending',
        },
        ...list,
      ])
      notify(`“${form.title}” created and published to ${form.batch}.`)
    }
    setModalOpen(false)
  }

  const remove = (row) => {
    setRows((list) => list.filter((r) => r.id !== row.id))
    notify(`“${row.title}” deleted.`, 'info')
  }

  const filtered = rows.filter(
    (r) => (!batch || r.batch === batch) && (!status || r.status === status)
  )

  const columns = [
    {
      key: 'title',
      header: 'Assignment',
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{r.title}</p>
          <p className="truncate text-[12px] text-neutral-500">{r.subject}</p>
        </div>
      ),
    },
    { key: 'batch', header: 'Batch', sortable: true, render: (r) => <Badge tone="neutral">{r.batch}</Badge> },
    {
      key: 'due',
      header: 'Due',
      sortable: true,
      render: (r) => (
        <span className="tnum inline-flex items-center gap-1.5 text-neutral-600">
          <CalendarClock size={13} className="text-neutral-400" aria-hidden="true" />
          {r.due}
        </span>
      ),
    },
    { key: 'points', header: 'Points', sortable: true, align: 'right', render: (r) => <span className="tnum">{r.points}</span> },
    {
      key: 'submitted',
      header: 'Submissions',
      sortable: true,
      sortValue: (r) => r.submitted / r.total,
      width: '190px',
      render: (r) => (
        <div className="w-40">
          <p className="tnum mb-1 text-[12px] text-neutral-500">
            {r.submitted} of {r.total}
          </p>
          <ProgressBar
            value={(r.submitted / r.total) * 100}
            label={`${r.title} submissions`}
            tone={r.submitted / r.total < 0.3 ? 'warning' : 'brand'}
          />
        </div>
      ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Create, publish and grade coursework across every active batch."
        actions={<Button variant="primary" icon={Plus} onClick={openCreate}>New assignment</Button>}
      />

      <DataTable
        columns={columns}
        rows={filtered}
        searchKeys={['title', 'subject', 'batch']}
        searchPlaceholder="Search assignments…"
        filters={[
          { key: 'batch', label: 'Batch', options: BATCHES, value: batch, onChange: setBatch },
          { key: 'status', label: 'Status', options: ['Active', 'Pending', 'Completed'], value: status, onChange: setStatus },
        ]}
        actions={(row) => [
          { label: 'View submissions', icon: Eye, onSelect: () => notify(`${row.submitted} submissions for “${row.title}”.`, 'info') },
          { label: 'Edit', icon: Pencil, onSelect: () => openEdit(row) },
          { label: 'Delete', icon: Trash2, tone: 'danger', onSelect: () => remove(row) },
        ]}
        emptyTitle="No assignments found"
        emptyMessage="Create an assignment or clear the active filters."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editing ? 'Edit assignment' : 'Create assignment'}
        description="Learners are notified as soon as the assignment is published."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>
              {editing ? 'Save changes' : 'Publish assignment'}
            </Button>
          </>
        }
      >
        <form onSubmit={save} className="space-y-4">
          <Field label="Title" htmlFor="as-title" required>
            <Input
              id="as-title"
              value={form.title}
              onChange={setField('title')}
              placeholder="e.g. Build a responsive dashboard"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Subject" htmlFor="as-subject">
              <Select id="as-subject" value={form.subject} onChange={setField('subject')}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Batch" htmlFor="as-batch">
              <Select id="as-batch" value={form.batch} onChange={setField('batch')}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Submission deadline" htmlFor="as-due" required>
              <Input id="as-due" type="date" value={form.due} onChange={setField('due')} />
            </Field>
            <Field label="Total points" htmlFor="as-points">
              <Input id="as-points" type="number" min={0} max={500} value={form.points} onChange={setField('points')} />
            </Field>
          </div>

          <Field label="Instructions" htmlFor="as-instructions">
            <Textarea
              id="as-instructions"
              rows={4}
              value={form.instructions}
              onChange={setField('instructions')}
              placeholder="What learners have to build, and what to hand in."
            />
          </Field>

          <Field
            label="Grading criteria"
            htmlFor="as-rubric"
            hint="Weightings shown to learners alongside their score."
          >
            <Input id="as-rubric" value={form.rubric} onChange={setField('rubric')} />
          </Field>

          <Field label="Attachment" hint="PDF, DOCX or ZIP up to 25 MB.">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
              <Upload size={18} className="text-neutral-400" aria-hidden="true" />
              <span className="text-[13px] font-medium text-neutral-700">
                {form.attachment || 'Click to upload a brief'}
              </span>
              <span className="text-[12px] text-neutral-500">or drag and drop it here</span>
              <input
                type="file"
                className="sr-only"
                onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.files?.[0]?.name ?? '' }))}
              />
            </label>
          </Field>

          <label className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={form.allowLate}
              onChange={setField('allowLate')}
              className="h-4 w-4 rounded border-neutral-300 text-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
            <span className="text-[13px] text-neutral-700">
              Accept late submissions with a 10% penalty
            </span>
          </label>
        </form>
      </Modal>
    </>
  )
}
