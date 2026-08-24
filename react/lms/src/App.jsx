import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import StudyMaterial from './pages/StudyMaterial.jsx'
import VideoLectures from './pages/VideoLectures.jsx'
import Assignments from './pages/Assignments.jsx'
import Quizzes from './pages/Quizzes.jsx'
import EntryTest from './pages/EntryTest.jsx'
import Students from './pages/Students.jsx'
import DailyPlanner from './pages/DailyPlanner.jsx'
import ManualPlanner from './pages/ManualPlanner.jsx'
import UnmatchedParticipants from './pages/UnmatchedParticipants.jsx'
import CheckIn from './pages/CheckIn.jsx'
import MyLectures from './pages/MyLectures.jsx'
import LeaveRequests from './pages/LeaveRequests.jsx'
import Settings from './pages/Settings.jsx'
import Profile from './pages/Profile.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* LMS Portal */}
        <Route path="/lms">
          <Route index element={<Navigate to="/lms/study-material" replace />} />
          <Route path="study-material" element={<StudyMaterial />} />
          <Route path="video-lectures" element={<VideoLectures />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="quizzes" element={<Quizzes />} />
        </Route>

        <Route path="/entry-test" element={<EntryTest />} />
        <Route path="/students" element={<Students />} />

        {/* Planning */}
        <Route path="/planning">
          <Route index element={<Navigate to="/planning/daily-planner" replace />} />
          <Route path="daily-planner" element={<DailyPlanner />} />
          <Route path="manual-planner" element={<ManualPlanner />} />
          <Route path="unmatched-participants" element={<UnmatchedParticipants />} />
        </Route>

        {/* My Portal */}
        <Route path="/my-portal">
          <Route index element={<Navigate to="/my-portal/check-in" replace />} />
          <Route path="check-in" element={<CheckIn />} />
          <Route path="my-lectures" element={<MyLectures />} />
          <Route path="leave-requests" element={<LeaveRequests />} />
        </Route>

        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
