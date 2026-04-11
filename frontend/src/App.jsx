import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { getMe } from './store/slices/authSlice'
import { useSocket } from './hooks/useSocket'

// Layouts
import DashboardLayout from './components/common/DashboardLayout'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth pages
import LoginPage from './pages/auth/LoginPage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageTeachers from './pages/admin/ManageTeachers'
import AdminFees from './pages/admin/AdminFees'
import AdminNotifications from './pages/admin/AdminNotifications'

// Teacher pages
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import MarkAttendance from './pages/teacher/MarkAttendance'
import UploadResults from './pages/teacher/UploadResults'
import ManageAssignments from './pages/teacher/ManageAssignments'

// Student pages
import StudentDashboard from './pages/student/StudentDashboard'
import MyAttendance from './pages/student/MyAttendance'
import MyResults from './pages/student/MyResults'
import MyFees from './pages/student/MyFees'
import MyAssignments from './pages/student/MyAssignments'

// Common
import ProfilePage from './pages/common/ProfilePage'
import NotFoundPage from './pages/common/NotFoundPage'

function AppRoutes() {
  useSocket()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const getDashboardPath = () => {
    if (!user) return '/login'
    if (user.role === 'admin') return '/admin/dashboard'
    if (user.role === 'teacher') return '/teacher/dashboard'
    return '/student/dashboard'
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDashboardPath()} />} />

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/teachers" element={<ManageTeachers />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>
      </Route>

      {/* Teacher Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/attendance" element={<MarkAttendance />} />
          <Route path="/teacher/results" element={<UploadResults />} />
          <Route path="/teacher/assignments" element={<ManageAssignments />} />
        </Route>
      </Route>

      {/* Student Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<MyAttendance />} />
          <Route path="/student/results" element={<MyResults />} />
          <Route path="/student/fees" element={<MyFees />} />
          <Route path="/student/assignments" element={<MyAssignments />} />
        </Route>
      </Route>

      {/* Common Protected */}
      <Route element={<ProtectedRoute allowedRoles={['admin', 'teacher', 'student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={isAuthenticated ? getDashboardPath() : '/login'} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  const dispatch = useDispatch()
  const { accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken) dispatch(getMe())
  }, [])

  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  )
}
