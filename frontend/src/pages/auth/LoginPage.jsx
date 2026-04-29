import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../../store/slices/authSlice'
import { toast } from 'react-toastify'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearError())
    const res = await dispatch(login(form))
    if (res.meta.requestStatus === 'rejected') {
      toast.error(res.payload || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <GraduationCap size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">EduERP</h1>
          <p className="text-indigo-300 mt-1">Student Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@school.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Credentials</p>
            <div className="space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between"><span className="font-medium">Teacher:</span><span>teacher@eduerp.com / teacher123</span></div>
              <div className="flex justify-between"><span className="font-medium">Student:</span><span>student@eduerp.com / student123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
