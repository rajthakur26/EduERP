import { useEffect, useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const EMPTY = { title: '', description: '', subject: '', class: '', section: '', dueDate: '', maxMarks: 100 }

export default function ManageAssignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const fetchAssignments = async () => {
    try { const { data } = await api.get('/assignments'); setAssignments(data.assignments) }
    catch { toast.error('Failed to load assignments') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/assignments', form)
      toast.success('Assignment created'); setShowForm(false); setForm(EMPTY); fetchAssignments()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleClose = async (id) => {
    try { await api.put(`/assignments/${id}`, { status: 'closed' }); toast.success('Assignment closed'); fetchAssignments() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm">{assignments.length} total assignments</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Assignment</button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No assignments yet. Create your first one!</div>
        ) : assignments.map((a) => (
          <div key={a._id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className={a.status === 'active' ? 'badge-green' : 'badge-red'}>{a.status}</span>
                  <span className="badge-blue">{a.subject}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Class {a.class}-{a.section} • Due: {new Date(a.dueDate).toLocaleDateString()} • Max: {a.maxMarks} marks</p>
                {a.description && <p className="text-sm text-gray-600 mt-2">{a.description}</p>}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {a.status === 'active' && <button onClick={() => handleClose(a._id)} className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg">Close</button>}
                <button onClick={() => setExpanded(expanded === a._id ? null : a._id)} className="p-2 hover:bg-gray-100 rounded-lg">
                  {expanded === a._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>
            </div>

            {expanded === a._id && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-3">Submissions ({a.submissions?.length || 0})</h4>
                {a.submissions?.length > 0 ? (
                  <div className="space-y-2">
                    {a.submissions.map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                        <span className="text-gray-600">Student ID: {s.student?.toString().slice(-6)}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">{new Date(s.submittedAt).toLocaleDateString()}</span>
                          <span className={s.status === 'graded' ? 'badge-green' : s.status === 'late' ? 'badge-red' : 'badge-blue'}>{s.status}</span>
                          {s.marks > 0 && <span className="font-medium">{s.marks}/{a.maxMarks}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400 py-4 text-center">No submissions yet</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Create Assignment</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div><label className="label">Title</label><input className="input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><label className="label">Description</label><textarea className="input resize-none" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Subject</label><input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
                <div><label className="label">Max Marks</label><input type="number" className="input" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: Number(e.target.value) })} /></div>
                <div><label className="label">Class</label><input className="input" required value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
                <div><label className="label">Section</label><input className="input" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
                <div className="col-span-2"><label className="label">Due Date</label><input type="datetime-local" className="input" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
