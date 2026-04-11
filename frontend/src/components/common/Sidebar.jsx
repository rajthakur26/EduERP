import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, ClipboardList,
  FileText, DollarSign, Bell, BookOpen, ChevronRight
} from 'lucide-react'

const adminLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: GraduationCap, label: 'Students' },
  { to: '/admin/teachers', icon: Users, label: 'Teachers' },
  { to: '/admin/fees', icon: DollarSign, label: 'Fee Management' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
]

const teacherLinks = [
  { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/teacher/attendance', icon: UserCheck, label: 'Mark Attendance' },
  { to: '/teacher/results', icon: FileText, label: 'Upload Results' },
  { to: '/teacher/assignments', icon: BookOpen, label: 'Assignments' },
]

const studentLinks = [
  { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/student/attendance', icon: UserCheck, label: 'My Attendance' },
  { to: '/student/results', icon: FileText, label: 'My Results' },
  { to: '/student/fees', icon: DollarSign, label: 'My Fees' },
  { to: '/student/assignments', icon: BookOpen, label: 'Assignments' },
]

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth)
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'teacher' ? teacherLinks : studentLinks

  return (
    <div className="h-full flex flex-col text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-indigo-800">
        <div className="w-8 h-8 bg-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">E</div>
        <span className="font-bold text-lg">EduERP</span>
      </div>

      {/* Role badge */}
      <div className="px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
          {user?.role} Portal
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 pb-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Profile link */}
      <div className="px-4 pb-6 border-t border-indigo-800 pt-4">
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-200 hover:bg-indigo-800 hover:text-white transition-colors"
        >
          <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate">{user?.name}</p>
            <p className="text-xs text-indigo-400 truncate">{user?.email}</p>
          </div>
        </NavLink>
      </div>
    </div>
  )
}
