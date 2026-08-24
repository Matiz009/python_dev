import { useState } from 'react'
import { Clock, Eye, LayoutGrid, List, Play, Plus, Trash2, Upload, Video } from 'lucide-react'
import {
  Badge, Button, Card, EmptyState, Field, Input, Modal, PageHeader, SearchInput, Select, Textarea,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, SUBJECTS, VIDEO_LECTURES } from '../data/mockData.js'

const BLANK = {
  title: '', subject: SUBJECTS[0], batch: BATCHES[0],
  duration: '', source: 'Upload', url: '', description: '',
}

/** Deterministic thumbnail tint per subject, so the grid stays visually stable. */
const SUBJECT_TINT = {
  'Web Development': 'from-blue-500/15 to-blue-500/5 text-blue-700',
  'Data Science': 'from-orange-500/15 to-orange-500/5 text-orange-700',
  'Cloud & DevOps': 'from-emerald-500/15 to-emerald-500/5 text-emerald-700',
  'UI/UX Design': 'from-violet-500/15 to-violet-500/5 text-violet-700',
  'Cyber Security': 'from-red-500/15 to-red-500/5 text-red-700',
}

export default function VideoLectures() {
  const { notify } = useApp()
  const [rows, setRows] = useState(VIDEO_LECTURES)
  const [view, setView] = useState('grid')
  const [query, setQuery] = useState('')
  const [batch, setBatch] = useState('')
  const [subject, setSubject] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const filtered = rows.filter((r) => {
    const needle = query.trim().toLowerCase()
    return (
      (!needle || `${r.title} ${r.subject} ${r.instructor}`.toLowerCase().includes(needle)) &&
      (!batch || r.batch === batch) &&
      (!subject || r.subject === subject)
    )
  })

  const publish = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      notify('Give the lecture a title before publishing.', 'info')
      return
    }
    setRows((list) => [
      {
        ...form,
        id: `VL-${String(list.length + 1).padStart(2, '0')}`,
        duration: form.duration || '00:00',
        views: 0,
        published: new Date().toISOString().slice(0, 10),
        instructor: 'Mati ul Rehman',
      },
      ...list,
    ])
    notify(`“${form.title}” published to ${form.batch}.`)
    setModalOpen(false)
    setForm(BLANK)
  }

  const remove = (row) => {
    setRows((list) => list.filter((r) => r.id !== row.id))
    notify(`“${row.title}” removed.`, 'info')
  }

  return (
    <>
      <PageHeader
        title="Video lectures"
        subtitle="Recorded sessions organised by batch and subject."
        actions={<Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Upload lecture</Button>}
      />

      <Card className="mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search lectures or instructors…"
            className="min-w-[200px] flex-1 sm:max-w-xs"
          />
          <Select value={batch} onChange={(e) => setBatch(e.target.value)} aria-label="Filter by batch" className="w-auto min-w-[9.5rem]">
            <option value="">Batch: All</option>
            {BATCHES.map((b) => <option key={b}>{b}</option>)}
          </Select>
          <Select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject" className="w-auto min-w-[10rem]">
            <option value="">Subject: All</option>
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </Select>

          <div className="ml-auto flex items-center gap-1 rounded-lg bg-neutral-100 p-1">
            {[
              { id: 'grid', icon: LayoutGrid, label: 'Grid view' },
              { id: 'list', icon: List, label: 'List view' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-label={v.label}
                aria-pressed={view === v.id}
                className={`rounded-md p-1.5 transition-colors ${
                  view === v.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <v.icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No lectures match those filters"
            message="Try a different batch or subject, or clear the search."
            icon={Video}
            action={<Button onClick={() => { setQuery(''); setBatch(''); setSubject('') }}>Clear filters</Button>}
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden">
              <div
                className={`relative grid h-36 place-items-center bg-gradient-to-br ${
                  SUBJECT_TINT[item.subject] ?? 'from-neutral-200 to-neutral-100 text-neutral-500'
                }`}
              >
                <button
                  type="button"
                  onClick={() => notify(`Playing “${item.title}”.`, 'info')}
                  aria-label={`Play ${item.title}`}
                  className="grid h-12 w-12 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-md transition-transform hover:scale-105"
                >
                  <Play size={18} fill="currentColor" aria-hidden="true" />
                </button>
                <span className="tnum absolute right-2 bottom-2 rounded bg-neutral-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {item.duration}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-[14px] font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-1 text-[12.5px] text-neutral-500">{item.instructor}</p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone="neutral">{item.batch}</Badge>
                  <Badge tone="brand">{item.subject}</Badge>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-3 text-[12px] text-neutral-500">
                  <span className="tnum inline-flex items-center gap-1">
                    <Eye size={13} aria-hidden="true" /> {item.views}
                  </span>
                  <span className="tnum inline-flex items-center gap-1">
                    <Clock size={13} aria-hidden="true" /> {item.published}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => remove(item)}
                  >
                    <Trash2 size={15} className="text-red-600" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-neutral-100">
            {filtered.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/70 sm:px-5">
                <button
                  type="button"
                  onClick={() => notify(`Playing “${item.title}”.`, 'info')}
                  aria-label={`Play ${item.title}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neutral-900 text-white transition-transform hover:scale-105"
                >
                  <Play size={14} fill="currentColor" aria-hidden="true" />
                </button>
                <div className="min-w-[180px] flex-1">
                  <p className="truncate text-[13.5px] font-medium text-neutral-900">{item.title}</p>
                  <p className="truncate text-[12px] text-neutral-500">
                    {item.instructor} · {item.subject}
                  </p>
                </div>
                <Badge tone="neutral">{item.batch}</Badge>
                <span className="tnum hidden w-16 text-right text-[12.5px] text-neutral-500 sm:block">{item.duration}</span>
                <span className="tnum hidden w-14 text-right text-[12.5px] text-neutral-500 md:block">{item.views} views</span>
                <Button size="icon" variant="ghost" aria-label={`Delete ${item.title}`} onClick={() => remove(item)}>
                  <Trash2 size={15} className="text-red-600" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Upload video lecture"
        description="Publish a recording to a batch, or link an existing stream."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={publish}>Publish</Button>
          </>
        }
      >
        <form onSubmit={publish} className="space-y-4">
          <Field label="Title" htmlFor="vl-title" required>
            <Input id="vl-title" value={form.title} onChange={setField('title')} placeholder="e.g. State management with useReducer" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Subject" htmlFor="vl-subject">
              <Select id="vl-subject" value={form.subject} onChange={setField('subject')}>
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Batch" htmlFor="vl-batch">
              <Select id="vl-batch" value={form.batch} onChange={setField('batch')}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Duration" htmlFor="vl-duration" hint="mm:ss or h:mm:ss">
              <Input id="vl-duration" value={form.duration} onChange={setField('duration')} placeholder="48:12" />
            </Field>
            <Field label="Source" htmlFor="vl-source">
              <Select id="vl-source" value={form.source} onChange={setField('source')}>
                <option>Upload</option>
                <option>External link</option>
              </Select>
            </Field>
          </div>

          {form.source === 'External link' ? (
            <Field label="Stream URL" htmlFor="vl-url">
              <Input id="vl-url" type="url" value={form.url} onChange={setField('url')} placeholder="https://…" />
            </Field>
          ) : (
            <Field label="Video file" hint="MP4 or MOV up to 2 GB.">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40">
                <Upload size={18} className="text-neutral-400" aria-hidden="true" />
                <span className="text-[13px] font-medium text-neutral-700">
                  {form.url || 'Click to choose a video'}
                </span>
                <span className="text-[12px] text-neutral-500">or drag and drop it here</span>
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.files?.[0]?.name ?? '' }))}
                />
              </label>
            </Field>
          )}

          <Field label="Description" htmlFor="vl-desc">
            <Textarea id="vl-desc" rows={3} value={form.description} onChange={setField('description')} placeholder="What the session covers." />
          </Field>
        </form>
      </Modal>
    </>
  )
}
