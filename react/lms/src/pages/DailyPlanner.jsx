import { useState } from 'react'
import { Clock, DoorOpen, GripVertical, Plus, Users } from 'lucide-react'
import {
  Badge, Button, Card, Field, Input, Modal, PageHeader, Select,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'
import { BATCHES, PLANNER_COLUMNS, PLANNER_TASKS, TODAY } from '../data/mockData.js'

const PRIORITY_TONES = { High: 'critical', Medium: 'warning', Low: 'neutral' }

const COLUMN_ACCENT = {
  Unscheduled: 'bg-neutral-400',
  Scheduled: 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  Delivered: 'bg-brand-500',
}

const BLANK = { title: '', batch: BATCHES[0], room: 'Lab 1', time: '', priority: 'Medium', column: 'Unscheduled' }

export default function DailyPlanner() {
  const { notify } = useApp()
  const [tasks, setTasks] = useState(PLANNER_TASKS)
  const [dragId, setDragId] = useState(null)
  const [overColumn, setOverColumn] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(BLANK)

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const moveTask = (id, column) => {
    setTasks((list) => list.map((t) => (t.id === id ? { ...t, column } : t)))
  }

  const onDrop = (column) => {
    if (!dragId) return
    const task = tasks.find((t) => t.id === dragId)
    if (task && task.column !== column) {
      moveTask(dragId, column)
      notify(`“${task.title}” moved to ${column}.`)
    }
    setDragId(null)
    setOverColumn(null)
  }

  const addTask = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      notify('The lecture needs a title.', 'info')
      return
    }
    setTasks((list) => [
      { ...form, id: `PT-${String(list.length + 1).padStart(2, '0')}`, time: form.time || 'Unassigned' },
      ...list,
    ])
    notify(`“${form.title}” added to ${form.column}.`)
    setModalOpen(false)
    setForm(BLANK)
  }

  return (
    <>
      <PageHeader
        title="Daily planner"
        subtitle={`Lecture board for ${TODAY.toDateString()} — drag a card between columns to reschedule.`}
        actions={<Button variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>Add lecture</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANNER_COLUMNS.map((column) => {
          const columnTasks = tasks.filter((t) => t.column === column)
          const isOver = overColumn === column

          return (
            <section
              key={column}
              onDragOver={(e) => {
                e.preventDefault()
                setOverColumn(column)
              }}
              onDragLeave={() => setOverColumn((c) => (c === column ? null : c))}
              onDrop={() => onDrop(column)}
              className={`flex flex-col rounded-xl border p-3 transition-colors ${
                isOver ? 'border-brand-400 bg-brand-50/50' : 'border-neutral-200 bg-neutral-100/60'
              }`}
              aria-label={`${column} lectures`}
            >
              <header className="mb-3 flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${COLUMN_ACCENT[column]}`} aria-hidden="true" />
                <h2 className="text-[13px] font-semibold text-neutral-800">{column}</h2>
                <span className="tnum ml-auto rounded-full bg-white px-2 py-0.5 text-[11.5px] font-medium text-neutral-600 ring-1 ring-neutral-200 ring-inset">
                  {columnTasks.length}
                </span>
              </header>

              <div className="flex flex-1 flex-col gap-2.5">
                {columnTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-neutral-300 px-3 py-6 text-center text-[12.5px] text-neutral-400">
                    Drop a lecture here
                  </p>
                ) : (
                  columnTasks.map((task) => (
                    <article
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => {
                        setDragId(null)
                        setOverColumn(null)
                      }}
                      className={`group cursor-grab rounded-lg border border-neutral-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing ${
                        dragId === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={14}
                          className="mt-0.5 shrink-0 text-neutral-300 group-hover:text-neutral-400"
                          aria-hidden="true"
                        />
                        <h3 className="flex-1 text-[13px] leading-snug font-medium text-neutral-900">
                          {task.title}
                        </h3>
                      </div>

                      <div className="mt-2.5 ml-6 space-y-1.5 text-[12px] text-neutral-500">
                        <p className="flex items-center gap-1.5">
                          <Users size={12} aria-hidden="true" /> {task.batch}
                        </p>
                        <p className="tnum flex items-center gap-1.5">
                          <Clock size={12} aria-hidden="true" /> {task.time}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <DoorOpen size={12} aria-hidden="true" /> {task.room}
                        </p>
                      </div>

                      <div className="mt-2.5 ml-6 flex items-center gap-2">
                        <Badge tone={PRIORITY_TONES[task.priority]}>{task.priority}</Badge>

                        {/* Keyboard-accessible fallback for the drag interaction. */}
                        <label className="ml-auto">
                          <span className="sr-only">Move “{task.title}” to another column</span>
                          <select
                            value={task.column}
                            onChange={(e) => {
                              moveTask(task.id, e.target.value)
                              notify(`“${task.title}” moved to ${e.target.value}.`)
                            }}
                            className="rounded-md border border-neutral-200 bg-white px-1.5 py-1 text-[11.5px] text-neutral-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                          >
                            {PLANNER_COLUMNS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          )
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add lecture to the board"
        description="New cards land in the column you pick below."
        footer={
          <>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={addTask}>Add lecture</Button>
          </>
        }
      >
        <form onSubmit={addTask} className="space-y-4">
          <Field label="Lecture title" htmlFor="dp-title" required>
            <Input id="dp-title" value={form.title} onChange={setField('title')} placeholder="e.g. React router deep dive" />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Batch" htmlFor="dp-batch">
              <Select id="dp-batch" value={form.batch} onChange={setField('batch')}>
                {BATCHES.map((b) => <option key={b}>{b}</option>)}
              </Select>
            </Field>
            <Field label="Room" htmlFor="dp-room">
              <Select id="dp-room" value={form.room} onChange={setField('room')}>
                {['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Studio', 'Zoom A', 'Zoom B'].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </Select>
            </Field>
            <Field label="Time slot" htmlFor="dp-time" hint="e.g. 09:00 - 10:30">
              <Input id="dp-time" value={form.time} onChange={setField('time')} placeholder="09:00 - 10:30" />
            </Field>
            <Field label="Priority" htmlFor="dp-priority">
              <Select id="dp-priority" value={form.priority} onChange={setField('priority')}>
                {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
              </Select>
            </Field>
          </div>

          <Field label="Column" htmlFor="dp-column">
            <Select id="dp-column" value={form.column} onChange={setField('column')}>
              {PLANNER_COLUMNS.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </form>
      </Modal>
    </>
  )
}
