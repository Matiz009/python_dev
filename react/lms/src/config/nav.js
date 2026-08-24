import {
  LayoutDashboard, GraduationCap, FileCheck2, Users, CalendarRange, UserCog, Settings,
  BookOpen, Video, ClipboardList, HelpCircle,
  CalendarDays, CalendarCog, UserRoundX,
  Fingerprint, Presentation, PlaneTakeoff,
} from 'lucide-react'

/**
 * Single source of truth for the sidebar, the router and the breadcrumb trail.
 * `children` turns an item into a collapsible section; `path` makes it a leaf route.
 */
export const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  {
    id: 'lms', label: 'LMS Portal', icon: GraduationCap, basePath: '/lms',
    children: [
      { id: 'study-material', label: 'Study Material', icon: BookOpen, path: '/lms/study-material' },
      { id: 'video-lectures', label: 'Video Lectures', icon: Video, path: '/lms/video-lectures' },
      { id: 'assignments', label: 'Assignments', icon: ClipboardList, path: '/lms/assignments' },
      { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, path: '/lms/quizzes' },
    ],
  },
  { id: 'entry-test', label: 'Entry Test', icon: FileCheck2, path: '/entry-test' },
  { id: 'students', label: 'Students', icon: Users, path: '/students' },
  {
    id: 'planning', label: 'Planning', icon: CalendarRange, basePath: '/planning',
    children: [
      { id: 'daily-planner', label: 'Daily Planner', icon: CalendarDays, path: '/planning/daily-planner' },
      { id: 'manual-planner', label: 'Manual Planner', icon: CalendarCog, path: '/planning/manual-planner' },
      { id: 'unmatched', label: 'Unmatched Participants', icon: UserRoundX, path: '/planning/unmatched-participants' },
    ],
  },
  {
    id: 'my-portal', label: 'My Portal', icon: UserCog, basePath: '/my-portal',
    children: [
      { id: 'check-in', label: 'Campus Check-In', icon: Fingerprint, path: '/my-portal/check-in' },
      { id: 'my-lectures', label: 'My Lectures', icon: Presentation, path: '/my-portal/my-lectures' },
      { id: 'leave-requests', label: 'Leave Requests', icon: PlaneTakeoff, path: '/my-portal/leave-requests' },
    ],
  },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

/** Routes that live outside the sidebar but still need a breadcrumb label. */
const EXTRA_LABELS = {
  '/profile': ['My Portal', 'Profile'],
  '/change-password': ['My Portal', 'Change Password'],
}

/** Flat list of every leaf route, for search and breadcrumb lookup. */
export const FLAT_ROUTES = NAV.flatMap((item) =>
  item.children
    ? item.children.map((c) => ({ ...c, parent: item.label, parentId: item.id }))
    : [{ ...item, parent: null, parentId: null }]
)

export function breadcrumbsFor(pathname) {
  if (EXTRA_LABELS[pathname]) return EXTRA_LABELS[pathname]
  const hit = FLAT_ROUTES.find((r) => r.path === pathname)
  if (!hit) return ['Dashboard']
  return hit.parent ? [hit.parent, hit.label] : [hit.label]
}
