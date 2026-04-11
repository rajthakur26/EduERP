import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import { markAllAsRead } from '../../store/slices/notificationSlice'
import { toast } from 'react-toastify'

export default function Topbar({ onMenuClick }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { unread, items } = useSelector((state) => state.notifications)
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const typeColor = { info: 'bg-blue-100', warning: 'bg-yellow-100', success: 'bg-green-100', error: 'bg-red-100' }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Menu size={20} className="text-gray-600" />
      </button>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false) }}
            className="p-2 rounded-lg hover:bg-gray-100 relative"
          >
            <Bell size={20} className="text-gray-600" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button onClick={() => dispatch(markAllAsRead())} className="text-xs text-indigo-600 hover:underline">Mark all read</button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-6">No notifications</p>
                ) : (
                  items.slice(0, 10).map((n) => (
                    <div key={n._id} className={`px-4 py-3 border-b hover:bg-gray-50 ${!n.isRead ? 'border-l-2 border-l-indigo-500' : ''}`}>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
            <ChevronDown size={14} className="text-gray-500" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-1">
              <button onClick={() => { navigate('/profile'); setShowUser(false) }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                <User size={16} /> Profile
              </button>
              <hr className="my-1" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
