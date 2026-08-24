import { useState } from 'react'
import { Check, Eye, EyeOff, KeyRound, ShieldCheck, X } from 'lucide-react'
import {
  Button, Card, CardHeader, Field, Input, PageHeader,
} from '../components/ui/Primitives.jsx'
import { useApp } from '../context/AppContext.jsx'

/** Policy the form enforces, and the checklist the reader sees. */
const RULES = [
  { id: 'length', label: 'At least 10 characters', test: (v) => v.length >= 10 },
  { id: 'upper', label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'digit', label: 'One number', test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'One symbol (!@#$…)', test: (v) => /[^A-Za-z0-9]/.test(v) },
]

const STRENGTH = [
  { label: 'Very weak', tone: 'bg-red-500', text: 'text-red-700' },
  { label: 'Weak', tone: 'bg-red-500', text: 'text-red-700' },
  { label: 'Fair', tone: 'bg-amber-500', text: 'text-amber-700' },
  { label: 'Good', tone: 'bg-amber-500', text: 'text-amber-700' },
  { label: 'Strong', tone: 'bg-brand-500', text: 'text-brand-700' },
  { label: 'Excellent', tone: 'bg-brand-600', text: 'text-brand-800' },
]

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-neutral-400 transition-colors hover:text-neutral-700"
      >
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export default function ChangePassword() {
  const { notify } = useApp()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const passed = RULES.filter((r) => r.test(form.next))
  const score = passed.length
  const strength = STRENGTH[score]
  const mismatch = form.confirm.length > 0 && form.next !== form.confirm
  const canSubmit = form.current && score === RULES.length && form.next === form.confirm

  const submit = (e) => {
    e.preventDefault()
    if (!form.current) {
      notify('Enter your current password.', 'info')
      return
    }
    if (score < RULES.length) {
      notify('The new password does not meet every requirement yet.', 'info')
      return
    }
    if (form.next !== form.confirm) {
      notify('The two new passwords do not match.', 'info')
      return
    }
    notify('Password changed. Use it the next time you sign in.')
    setForm({ current: '', next: '', confirm: '' })
  }

  return (
    <>
      <PageHeader title="Change password" subtitle="Pick something strong — this account can see student records." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Update your password"
            subtitle="You stay signed in on this device after the change."
            actions={<KeyRound size={18} className="text-neutral-400" aria-hidden="true" />}
          />
          <form onSubmit={submit}>
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Current password" htmlFor="cp-current" required>
                <PasswordInput
                  id="cp-current"
                  value={form.current}
                  onChange={setField('current')}
                  autoComplete="current-password"
                />
              </Field>

              <Field label="New password" htmlFor="cp-next" required>
                <PasswordInput
                  id="cp-next"
                  value={form.next}
                  onChange={setField('next')}
                  autoComplete="new-password"
                />
              </Field>

              {form.next && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-1.5 flex-1 gap-1" role="presentation">
                      {RULES.map((rule, i) => (
                        <span
                          key={rule.id}
                          className={`h-full flex-1 rounded-full ${i < score ? strength.tone : 'bg-neutral-200'}`}
                        />
                      ))}
                    </div>
                    <span className={`text-[12px] font-medium ${strength.text}`}>{strength.label}</span>
                  </div>
                </div>
              )}

              <Field label="Confirm new password" htmlFor="cp-confirm" required>
                <PasswordInput
                  id="cp-confirm"
                  value={form.confirm}
                  onChange={setField('confirm')}
                  autoComplete="new-password"
                />
              </Field>

              {mismatch && (
                <p role="alert" className="flex items-center gap-1.5 text-[12.5px] text-red-700">
                  <X size={13} strokeWidth={2.5} aria-hidden="true" />
                  The two passwords do not match.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-neutral-200 bg-neutral-50/70 px-5 py-3.5">
              <Button type="button" onClick={() => setForm({ current: '', next: '', confirm: '' })}>
                Clear
              </Button>
              <Button type="submit" variant="primary" icon={ShieldCheck} disabled={!canSubmit}>
                Change password
              </Button>
            </div>
          </form>
        </Card>

        {/* --------------------------- Requirements --------------------------- */}
        <Card className="lg:col-span-2">
          <CardHeader title="Requirements" subtitle="All five must pass before you can save." />
          <ul className="space-y-2.5 p-4 sm:p-5">
            {RULES.map((rule) => {
              const ok = rule.test(form.next)
              return (
                <li key={rule.id} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                      ok ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                  </span>
                  <span className={ok ? 'text-neutral-800' : 'text-neutral-500'}>{rule.label}</span>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-neutral-100 px-4 pb-4 sm:px-5 sm:pb-5">
            <p className="mt-4 rounded-lg bg-neutral-50 px-3 py-2.5 text-[12.5px] text-neutral-600">
              Avoid reusing a password from another service. If two-factor authentication is enabled for
              your campus, you will still be asked for a one-time code at sign-in.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
