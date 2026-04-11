import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../store/slices/authSlice'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true)
    const res = await dispatch(updateProfile(form))
    if (res.meta.requestStatus === 'fulfilled') toast.success('Profile updated')
    else toast.error('Update failed')
    setSaving(false)
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    setChangingPw(true)
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      toast.success('Password changed successfully')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setChangingPw(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm">Manage your account settings</p>
      </div>

      {/* Avatar section */}
      <div className="card flex items-center gap-5">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-500">{user?.email}</p>
          <span className="inline-block mt-1 px-3 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-5">Edit Profile</h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50 cursor-not-allowed" value={user?.email} disabled />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your phone number" />
          </div>
          <div>
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-5">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
          </div>
          <button type="submit" disabled={changingPw} className="btn-primary">{changingPw ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>
    </div>
  )
}
