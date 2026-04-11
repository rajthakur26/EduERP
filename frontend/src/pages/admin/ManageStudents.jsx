import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const EMPTY_FORM = { name: '', email: '', password: '', rollNumber: '', class: '', section: '', parentName: '', parentPhone: '', gender: 'male' }

export default function ManageStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students', { params: { search } })
      setStudents(data.students)
    } catch { toast.error('Failed to fetch students') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents() }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/auth/register', { ...form, role: 'student' })
      toast.success('Student registered successfully')
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register student')
    } finally { setSaving(false) }
  }

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this student?')) return
    try {
      await api.delete(`/students/${id}`)
      toast.success('Student deactivated')
      fetchStudents()
    } catch { toast.error('Failed to deactivate') }
  }

  const filtered = students.filter((s) =>
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-gray-500 text-sm">{students.length} students enrolled</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input className="input pl-9" placeholder="Search by name, roll number..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Roll No', 'Name', 'Email', 'Class', 'Section', 'Parent', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No students found</td></tr>
              ) : filtered.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-4 py-3 font-medium">{s.user?.name}</td>
                  <td className="px-4 py-3 text-gray-500">{s.user?.email}</td>
                  <td className="px-4 py-3">{s.class}</td>
                  <td className="px-4 py-3">{s.section}</td>
                  <td className="px-4 py-3 text-gray-500">{s.parentName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={s.user?.isActive ? 'badge-green' : 'badge-red'}>
                      {s.user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeactivate(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Deactivate">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Register New Student</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="label">Full Name</label><input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Email</label><input type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Password</label><input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div><label className="label">Roll Number</label><input className="input" required value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
                <div><label className="label">Gender</label>
                  <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div><label className="label">Class</label><input className="input" required value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
                <div><label className="label">Section</label><input className="input" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                <div><label className="label">Parent Name</label><input className="input" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></div>
                <div><label className="label">Parent Phone</label><input className="input" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Registering...' : 'Register Student'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
