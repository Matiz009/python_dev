/* ------------------------------------------------------------------ *
 * Demo dataset. Everything is deterministic so the UI is stable across
 * reloads and the numbers in the cards agree with the tables.
 * ------------------------------------------------------------------ */

export const CURRENT_USER = {
  initials: 'MU',
  name: 'Mati',
  fullName: 'Mati ul Rehman',
  role: 'Lead Instructor',
  email: 'mati.rehman.dev@gmail.com',
  campus: 'Lahore - Gulberg Campus',
}

export const BATCHES = ['Batch 41-A', 'Batch 41-B', 'Batch 42-A', 'Batch 42-B', 'Batch 43-A']
export const SUBJECTS = ['Web Development', 'Data Science', 'Cloud & DevOps', 'UI/UX Design', 'Cyber Security']

/* ---------------------------------- KPIs --------------------------------- */

export const KPIS = [
  { id: 'students', label: 'Total Students', value: 2847, delta: 12.4, trend: 'up', hint: 'vs. previous intake', format: 'number' },
  { id: 'batches', label: 'Active Batches', value: 24, delta: 4.2, trend: 'up', hint: '3 starting this month', format: 'number' },
  { id: 'completion', label: 'Course Completion', value: 78.6, delta: 2.1, trend: 'up', hint: 'rolling 90 days', format: 'percent' },
  { id: 'attendance', label: 'Attendance Average', value: 91.3, delta: -1.8, trend: 'down', hint: 'all campuses, this month', format: 'percent' },
]

/* --------------------------------- Charts -------------------------------- */

// Intake growth - two series, area chart.
export const INTAKE_TREND = [
  { month: 'Sep', enrolled: 186, graduated: 120 },
  { month: 'Oct', enrolled: 214, graduated: 138 },
  { month: 'Nov', enrolled: 242, graduated: 155 },
  { month: 'Dec', enrolled: 198, graduated: 171 },
  { month: 'Jan', enrolled: 289, graduated: 164 },
  { month: 'Feb', enrolled: 321, graduated: 190 },
  { month: 'Mar', enrolled: 356, graduated: 212 },
  { month: 'Apr', enrolled: 342, graduated: 238 },
  { month: 'May', enrolled: 398, graduated: 255 },
  { month: 'Jun', enrolled: 431, graduated: 271 },
  { month: 'Jul', enrolled: 462, graduated: 298 },
  { month: 'Aug', enrolled: 489, graduated: 316 },
]

// Funding & grant distribution - 4 slices, direct-labelled.
export const FUNDING_SPLIT = [
  { name: 'Government Grant', value: 1284 },
  { name: 'Corporate Sponsor', value: 742 },
  { name: 'Self Financed', value: 531 },
  { name: 'Scholarship Fund', value: 290 },
]

// Per-batch enrolment vs capacity - single-series bar (capacity is a reference).
export const BATCH_METRICS = [
  { batch: '41-A', enrolled: 132, capacity: 150 },
  { batch: '41-B', enrolled: 118, capacity: 150 },
  { batch: '42-A', enrolled: 146, capacity: 150 },
  { batch: '42-B', enrolled: 97, capacity: 150 },
  { batch: '43-A', enrolled: 141, capacity: 150 },
]

/* ---------------------- Voucher & audit trail table ---------------------- */

const AUDIT_ACTIONS = [
  'Voucher generated', 'Fee reconciled', 'Batch roster locked', 'Grant disbursed',
  'Refund processed', 'Seat transferred', 'Late fee waived', 'Installment plan set',
]

const VOUCHER_NAMES = [
  'Ayesha Khan', 'Bilal Ahmed', 'Fatima Noor', 'Hamza Raza', 'Zainab Ali',
  'Usman Tariq', 'Maryam Iqbal', 'Daniyal Shah', 'Sana Javed', 'Owais Malik',
]

export const VOUCHERS = Array.from({ length: 42 }, (_, i) => {
  const n = i + 1
  const statuses = ['Active', 'Pending', 'Completed']
  const day = ((n * 3) % 28) + 1
  const hour = ((n * 5) % 12) + 8
  const minute = (n * 13) % 60
  const pad = (v) => String(v).padStart(2, '0')
  return {
    id: 'VCH-2026-' + String(1000 + n),
    batch: BATCHES[n % BATCHES.length],
    student: VOUCHER_NAMES[n % VOUCHER_NAMES.length],
    amount: 18000 + ((n * 1450) % 42000),
    action: AUDIT_ACTIONS[n % AUDIT_ACTIONS.length],
    timestamp: '2026-08-' + pad(day) + ' ' + pad(hour) + ':' + pad(minute),
    status: statuses[(n * 7) % 3],
  }
})

/* ------------------------------ LMS content ------------------------------ */

export const STUDY_MATERIAL = [
  { id: 'SM-01', title: 'React Hooks - Deep Dive Handbook', subject: 'Web Development', batch: 'Batch 42-A', type: 'PDF', size: '4.2 MB', updated: '2026-08-18', downloads: 312 },
  { id: 'SM-02', title: 'Pandas & NumPy Cheat Sheet', subject: 'Data Science', batch: 'Batch 41-B', type: 'PDF', size: '1.1 MB', updated: '2026-08-17', downloads: 488 },
  { id: 'SM-03', title: 'Kubernetes Objects Reference', subject: 'Cloud & DevOps', batch: 'Batch 42-B', type: 'DOCX', size: '820 KB', updated: '2026-08-15', downloads: 176 },
  { id: 'SM-04', title: 'Design Tokens & Theming Guide', subject: 'UI/UX Design', batch: 'Batch 43-A', type: 'PDF', size: '6.7 MB', updated: '2026-08-14', downloads: 204 },
  { id: 'SM-05', title: 'OWASP Top 10 - Annotated', subject: 'Cyber Security', batch: 'Batch 41-A', type: 'PDF', size: '3.4 MB', updated: '2026-08-12', downloads: 391 },
  { id: 'SM-06', title: 'SQL Window Functions Workbook', subject: 'Data Science', batch: 'Batch 42-A', type: 'XLSX', size: '540 KB', updated: '2026-08-11', downloads: 268 },
  { id: 'SM-07', title: 'Tailwind Utility Patterns', subject: 'Web Development', batch: 'Batch 43-A', type: 'PDF', size: '2.8 MB', updated: '2026-08-09', downloads: 355 },
  { id: 'SM-08', title: 'Terraform Module Starter Pack', subject: 'Cloud & DevOps', batch: 'Batch 41-B', type: 'ZIP', size: '12.4 MB', updated: '2026-08-06', downloads: 143 },
]

export const VIDEO_LECTURES = [
  { id: 'VL-01', title: 'State Management with useReducer', subject: 'Web Development', batch: 'Batch 42-A', duration: '48:12', views: 421, published: '2026-08-19', instructor: 'Mati ul Rehman' },
  { id: 'VL-02', title: 'Feature Engineering in Practice', subject: 'Data Science', batch: 'Batch 41-B', duration: '1:02:35', views: 388, published: '2026-08-18', instructor: 'Sadia Rauf' },
  { id: 'VL-03', title: 'CI/CD Pipelines with GitHub Actions', subject: 'Cloud & DevOps', batch: 'Batch 42-B', duration: '55:40', views: 297, published: '2026-08-16', instructor: 'Kamran Sheikh' },
  { id: 'VL-04', title: 'Accessible Component Patterns', subject: 'UI/UX Design', batch: 'Batch 43-A', duration: '39:08', views: 256, published: '2026-08-15', instructor: 'Hira Zubair' },
  { id: 'VL-05', title: 'Threat Modelling Workshop', subject: 'Cyber Security', batch: 'Batch 41-A', duration: '1:14:22', views: 334, published: '2026-08-13', instructor: 'Ali Hassan' },
  { id: 'VL-06', title: 'Async JavaScript End-to-End', subject: 'Web Development', batch: 'Batch 43-A', duration: '52:19', views: 445, published: '2026-08-12', instructor: 'Mati ul Rehman' },
  { id: 'VL-07', title: 'Model Evaluation & Drift', subject: 'Data Science', batch: 'Batch 42-A', duration: '46:55', views: 219, published: '2026-08-10', instructor: 'Sadia Rauf' },
  { id: 'VL-08', title: 'Observability with OpenTelemetry', subject: 'Cloud & DevOps', batch: 'Batch 41-B', duration: '58:03', views: 188, published: '2026-08-08', instructor: 'Kamran Sheikh' },
]

export const ASSIGNMENTS = [
  { id: 'AS-01', title: 'Build a Responsive Dashboard', subject: 'Web Development', batch: 'Batch 42-A', due: '2026-08-28', points: 100, submitted: 118, total: 132, status: 'Active' },
  { id: 'AS-02', title: 'Exploratory Data Analysis Report', subject: 'Data Science', batch: 'Batch 41-B', due: '2026-08-25', points: 80, submitted: 96, total: 118, status: 'Active' },
  { id: 'AS-03', title: 'Containerise a Node Service', subject: 'Cloud & DevOps', batch: 'Batch 42-B', due: '2026-08-20', points: 100, submitted: 91, total: 97, status: 'Completed' },
  { id: 'AS-04', title: 'Design System Audit', subject: 'UI/UX Design', batch: 'Batch 43-A', due: '2026-09-02', points: 60, submitted: 24, total: 141, status: 'Pending' },
  { id: 'AS-05', title: 'Secure a Vulnerable API', subject: 'Cyber Security', batch: 'Batch 41-A', due: '2026-08-30', points: 120, submitted: 63, total: 132, status: 'Active' },
]

export const QUIZZES = [
  { id: 'QZ-01', title: 'React Fundamentals - Week 4', subject: 'Web Development', batch: 'Batch 42-A', questions: 25, minutes: 30, attempts: 126, avgScore: 82.4, status: 'Active' },
  { id: 'QZ-02', title: 'Statistics Refresher', subject: 'Data Science', batch: 'Batch 41-B', questions: 20, minutes: 25, attempts: 111, avgScore: 74.9, status: 'Completed' },
  { id: 'QZ-03', title: 'Linux & Networking Basics', subject: 'Cloud & DevOps', batch: 'Batch 42-B', questions: 30, minutes: 40, attempts: 88, avgScore: 69.2, status: 'Active' },
  { id: 'QZ-04', title: 'Colour, Contrast & Type', subject: 'UI/UX Design', batch: 'Batch 43-A', questions: 15, minutes: 20, attempts: 0, avgScore: 0, status: 'Pending' },
  { id: 'QZ-05', title: 'Cryptography Essentials', subject: 'Cyber Security', batch: 'Batch 41-A', questions: 25, minutes: 35, attempts: 104, avgScore: 77.6, status: 'Active' },
]

/* -------------------------------- Students ------------------------------- */

const FIRST = ['Ayesha', 'Bilal', 'Fatima', 'Hamza', 'Zainab', 'Usman', 'Maryam', 'Daniyal', 'Sana', 'Owais', 'Nimra', 'Ahsan', 'Rabia', 'Talha', 'Hina', 'Saad', 'Areeba', 'Zohaib', 'Laiba', 'Faizan']
const LAST = ['Khan', 'Ahmed', 'Noor', 'Raza', 'Ali', 'Tariq', 'Iqbal', 'Shah', 'Javed', 'Malik']

export const STUDENTS = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1
  const first = FIRST[n % FIRST.length]
  const last = LAST[(n * 3) % LAST.length]
  const attendance = 62 + ((n * 17) % 38)
  const progress = 40 + ((n * 23) % 60)
  return {
    id: 'STD-' + String(2400 + n),
    name: first + ' ' + last,
    email: first.toLowerCase() + '.' + last.toLowerCase() + n + '@icampus.edu',
    batch: BATCHES[n % BATCHES.length],
    subject: SUBJECTS[(n * 2) % SUBJECTS.length],
    attendance,
    progress,
    status: attendance < 70 ? 'At Risk' : progress > 85 ? 'Completed' : 'Active',
  }
})

/* ------------------------------- Entry test ------------------------------ */

export const ENTRY_TESTS = Array.from({ length: 28 }, (_, i) => {
  const n = i + 1
  const score = 34 + ((n * 19) % 62)
  const day = ((n * 2) % 28) + 1
  return {
    id: 'ET-' + String(700 + n),
    candidate: FIRST[(n * 5) % FIRST.length] + ' ' + LAST[n % LAST.length],
    appliedFor: SUBJECTS[n % SUBJECTS.length],
    scheduled: '2026-09-' + String(day).padStart(2, '0'),
    centre: ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad'][n % 4],
    score,
    result: score >= 60 ? 'Passed' : score >= 45 ? 'Waitlisted' : 'Failed',
  }
})

/* -------------------------------- Planning ------------------------------- */

export const PLANNER_COLUMNS = ['Unscheduled', 'Scheduled', 'In Progress', 'Delivered']

export const PLANNER_TASKS = [
  { id: 'PT-01', title: 'React Router & Nested Layouts', batch: 'Batch 42-A', room: 'Lab 3', time: '09:00 - 10:30', column: 'Scheduled', priority: 'High' },
  { id: 'PT-02', title: 'Pandas GroupBy Clinic', batch: 'Batch 41-B', room: 'Lab 1', time: '10:45 - 12:15', column: 'In Progress', priority: 'Medium' },
  { id: 'PT-03', title: 'Docker Compose Lab', batch: 'Batch 42-B', room: 'Lab 2', time: '13:00 - 14:30', column: 'Scheduled', priority: 'High' },
  { id: 'PT-04', title: 'Wireframing Sprint Review', batch: 'Batch 43-A', room: 'Studio', time: '14:45 - 16:00', column: 'Unscheduled', priority: 'Low' },
  { id: 'PT-05', title: 'Pen-Test Report Walkthrough', batch: 'Batch 41-A', room: 'Lab 4', time: '16:15 - 17:45', column: 'Delivered', priority: 'Medium' },
  { id: 'PT-06', title: 'Async JS Recap Session', batch: 'Batch 43-A', room: 'Lab 3', time: '09:00 - 10:00', column: 'Delivered', priority: 'Low' },
  { id: 'PT-07', title: 'Model Deployment Demo', batch: 'Batch 42-A', room: 'Lab 1', time: '11:00 - 12:30', column: 'Unscheduled', priority: 'High' },
]

export const UNMATCHED_PARTICIPANTS = Array.from({ length: 14 }, (_, i) => {
  const n = i + 1
  return {
    id: 'UP-' + String(300 + n),
    name: FIRST[(n * 7) % FIRST.length] + ' ' + LAST[(n * 2) % LAST.length],
    preferredSubject: SUBJECTS[n % SUBJECTS.length],
    preferredSlot: ['Morning', 'Afternoon', 'Evening', 'Weekend'][n % 4],
    campus: ['Lahore', 'Karachi', 'Islamabad'][n % 3],
    waitingDays: ((n * 5) % 26) + 2,
    reason: ['No slot in preferred shift', 'Batch at capacity', 'Prerequisite pending', 'Awaiting fee clearance'][n % 4],
  }
})

/* ------------------------------ My lectures ------------------------------ */

export const MY_LECTURES = [
  { id: 'ML-01', title: 'React Router & Nested Layouts', batch: 'Batch 42-A', date: '2026-08-21', time: '09:00 - 10:30', mode: 'Physical', room: 'Lab 3', status: 'Delivered', attendees: 118 },
  { id: 'ML-02', title: 'Async JS Recap Session', batch: 'Batch 43-A', date: '2026-08-21', time: '11:00 - 12:00', mode: 'Online', room: 'Zoom A', status: 'Delivered', attendees: 124 },
  { id: 'ML-03', title: 'Component Testing Basics', batch: 'Batch 42-A', date: '2026-08-22', time: '09:00 - 10:30', mode: 'Physical', room: 'Lab 3', status: 'Scheduled', attendees: 0 },
  { id: 'ML-04', title: 'Tailwind Layout Systems', batch: 'Batch 43-A', date: '2026-08-22', time: '13:00 - 14:30', mode: 'Online', room: 'Zoom B', status: 'Scheduled', attendees: 0 },
  { id: 'ML-05', title: 'Performance Profiling', batch: 'Batch 42-B', date: '2026-08-23', time: '10:00 - 11:30', mode: 'Physical', room: 'Lab 2', status: 'Scheduled', attendees: 0 },
  { id: 'ML-06', title: 'Accessibility Clinic', batch: 'Batch 41-A', date: '2026-08-20', time: '15:00 - 16:30', mode: 'Physical', room: 'Lab 4', status: 'Cancelled', attendees: 0 },
]

/* ----------------------------- Leave requests ---------------------------- */

export const LEAVE_REQUESTS = [
  { id: 'LV-018', type: 'Annual Leave', from: '2026-09-08', to: '2026-09-12', days: 5, reason: 'Family commitment out of city.', status: 'Pending', applied: '2026-08-19', approver: 'Head of Faculty' },
  { id: 'LV-017', type: 'Sick Leave', from: '2026-08-04', to: '2026-08-05', days: 2, reason: 'Viral fever, medical note attached.', status: 'Approved', applied: '2026-08-04', approver: 'Head of Faculty' },
  { id: 'LV-016', type: 'Casual Leave', from: '2026-07-22', to: '2026-07-22', days: 1, reason: 'Personal errand in the morning shift.', status: 'Approved', applied: '2026-07-20', approver: 'Campus Director' },
  { id: 'LV-015', type: 'Annual Leave', from: '2026-07-01', to: '2026-07-10', days: 8, reason: 'Annual holiday with family.', status: 'Rejected', applied: '2026-06-18', approver: 'Campus Director' },
  { id: 'LV-014', type: 'Short Leave', from: '2026-06-14', to: '2026-06-14', days: 1, reason: 'Half day for a clinic appointment.', status: 'Approved', applied: '2026-06-13', approver: 'Head of Faculty' },
]

export const LEAVE_BALANCE = [
  { type: 'Annual Leave', used: 8, total: 20 },
  { type: 'Sick Leave', used: 4, total: 12 },
  { type: 'Casual Leave', used: 3, total: 10 },
]

/* -------------------------- Attendance register -------------------------- */

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const YEARS = [2024, 2025, 2026]
export const MODES = ['Physical', 'Online']

/** Small deterministic hash so a given (y, m, d, mode) always yields the same day. */
function hash(y, m, d, mode) {
  let h = (y * 397) ^ (m * 131) ^ (d * 37) ^ (mode === 'Online' ? 8191 : 3571)
  h = (h ^ (h >>> 13)) * 1274126177
  return Math.abs(h ^ (h >>> 16)) % 1000
}

/** "Today" for the demo, so the current month renders a realistic partial view. */
export const TODAY = new Date(2026, 7, 21)

/**
 * Builds one month of attendance. Weekends are non-working; days after
 * `today` are returned as `Upcoming` and excluded from every statistic.
 */
export function buildAttendance(year, monthIndex, mode, today = TODAY) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const isCurrentMonth = year === today.getFullYear() && monthIndex === today.getMonth()

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(year, monthIndex, day)
    const weekday = date.getDay()
    const isWeekend = weekday === 0 || weekday === 6

    if (isWeekend) return { day, date, weekday, status: 'Weekend', in: null, out: null, hours: 0 }

    const isFuture =
      year > today.getFullYear() ||
      (year === today.getFullYear() && monthIndex > today.getMonth()) ||
      (isCurrentMonth && day > today.getDate())
    if (isFuture) return { day, date, weekday, status: 'Upcoming', in: null, out: null, hours: 0 }

    // Each month carries its own absence pressure, so the register has good
    // months and bad ones — and the sub-70% warning is actually reachable.
    const absentCutoff = 45 + (hash(year, monthIndex, 0, mode) % 100) * 3
    const lateCutoff = absentCutoff + 150

    const r = hash(year, monthIndex, day, mode)
    let status
    if (r < absentCutoff) status = 'Absent'
    else if (r < lateCutoff) status = 'Late'
    else status = 'Present'

    if (status === 'Absent') return { day, date, weekday, status, in: null, out: null, hours: 0 }

    const lateBy = status === 'Late' ? 18 + (r % 42) : 0
    const startMin = 9 * 60 + lateBy
    const hours = 7.5 + ((r % 15) / 10) - lateBy / 60
    const endMin = startMin + Math.round(hours * 60)
    const fmt = (mins) =>
      String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0')

    return {
      day, date, weekday, status,
      in: fmt(startMin),
      out: fmt(endMin),
      hours: Math.round(hours * 100) / 100,
    }
  })
}

export function summarise(records) {
  const counted = records.filter((r) => r.status !== 'Weekend' && r.status !== 'Upcoming')
  const present = counted.filter((r) => r.status === 'Present').length
  const late = counted.filter((r) => r.status === 'Late').length
  const absent = counted.filter((r) => r.status === 'Absent').length
  const workingHours = counted.reduce((sum, r) => sum + r.hours, 0)
  const totalHours = counted.length * 8
  const rate = counted.length ? ((present + late) / counted.length) * 100 : 0

  return {
    present, late, absent,
    workingDays: counted.length,
    workingHours: Math.round(workingHours * 10) / 10,
    totalHours,
    rate: Math.round(rate * 10) / 10,
  }
}
