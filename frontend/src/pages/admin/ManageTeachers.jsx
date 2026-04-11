import { useEffect, useState } from 'react'
import { Plus, Search, Trash2, X } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const EMPTY = { name: '', email: '', password: '', employeeId: '', department: '', qualification: '', experience: 0, subjects: '', classes: '' }

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers')
      setTeachers(data.teachers)
    } catch { toast.error('Failed to fetch teachers') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchTeachers() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/auth/register', {
        ...form, role: 'teacher',
        subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
        classes: form.classes.split(',').map((c) => c.trim()).filter(Boolean),
      })
      toast.success('Teacher registered')
      setShowModal(false); setForm(EMPTY); fetchTeachers()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this teacher?')) return
    try { await api.delete(`/teachers/${id}`); toast.success('Teacher deactivated'); fetchTeachers() }
    catch { toast.error('Failed') }
  }

  const filtered = teachers.filter((t) =>
    t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.employeeId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teachers</h1>
          <p className="text-gray-500 text-sm">{teachers.length} teachers on staff</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Teacher</button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search by name or employee ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Employee ID', 'Name', 'Email', 'Department', 'Subjects', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No teachers found</td></tr>
              ) : filtered.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.employeeId}</td>
                  <td className="px-4 py-3 font-medium">{t.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.user?.email}</td>
                  <td className="px-4 py-3">{t.department || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{t.subjects?.join(', ') || '—'}</td>
                  <td className="px-4 py-3"><span className={t.user?.isActive ? 'badge-green' : 'badge-red'}>{t.user?.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeactivate(t._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Register New Teacher</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Full Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Password</label><input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div><label className="label">Employee ID</label><input className="input" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
                <div><label className="label">Department</label><input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
                <div><label className="label">Qualification</label><input className="input" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></div>
                <div><label className="label">Experience (years)</label><input type="number" className="input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Subjects (comma-separated)</label><input className="input" placeholder="Math, Physics, Chemistry" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Classes (comma-separated)</label><input className="input" placeholder="10A, 11B, 12C" value={form.classes} onChange={(e) => setForm({ ...form, classes: e.target.value })} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Registering...' : 'Register Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
