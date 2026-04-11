import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Save } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const STATUS_OPTIONS = [
  { value: 'present', label: 'P', color: 'bg-green-500 text-white', icon: CheckCircle },
  { value: 'absent', label: 'A', color: 'bg-red-500 text-white', icon: XCircle },
  { value: 'late', label: 'L', color: 'bg-yellow-500 text-white', icon: Clock },
  { value: 'excused', label: 'E', color: 'bg-blue-500 text-white', icon: CheckCircle },
]

export default function MarkAttendance() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ class: '', section: '', subject: 'General', date: new Date().toISOString().split('T')[0] })

  const fetchStudents = async () => {
    if (!form.class || !form.section) return
    setLoading(true)
    try {
      const { data } = await api.get('/students', { params: { class: form.class, section: form.section } })
      setStudents(data.students)
      const initialAtt = {}
      data.students.forEach((s) => { initialAtt[s._id] = 'present' })
      setAttendance(initialAtt)
    } catch { toast.error('Failed to fetch students') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!students.length) { toast.warning('No students loaded'); return }
    setSaving(true)
    try {
      const records = students.map((s) => ({ studentId: s._id, status: attendance[s._id] || 'absent' }))
      await api.post('/attendance', { records, date: form.date, subject: form.subject, class: form.class, section: form.section })
      toast.success(`Attendance saved for ${students.length} students`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const markAll = (status) => {
    const updated = {}
    students.forEach((s) => { updated[s._id] = status })
    setAttendance(updated)
  }

  const presentCount = Object.values(attendance).filter((s) => s === 'present').length
  const absentCount = Object.values(attendance).filter((s) => s === 'absent').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm">Select class and mark daily attendance</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="label">Class</label><input className="input" placeholder="e.g. 10" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
          <div><label className="label">Section</label><input className="input" placeholder="e.g. A" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
          <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        </div>
        <button onClick={fetchStudents} disabled={!form.class || !form.section} className="btn-primary mt-4">Load Students</button>
      </div>

      {students.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700">{students.length} students</span>
            <span className="badge-green">Present: {presentCount}</span>
            <span className="badge-red">Absent: {absentCount}</span>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => markAll('present')} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">All Present</button>
              <button onClick={() => markAll('absent')} className="text-xs px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">All Absent</button>
            </div>
          </div>

          {/* Student list */}
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Roll No</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Student Name</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={3} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.rollNumber}</td>
                      <td className="px-4 py-3 font-medium">{s.user?.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => setAttendance({ ...attendance, [s._id]: opt.value })}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${attendance[s._id] === opt.value ? opt.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                              title={opt.value}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </>
      )}
    </div>
  )
}
