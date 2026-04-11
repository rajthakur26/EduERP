import { useEffect, useState } from 'react'
import { Plus, Trash2, Save, X } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology']

export default function UploadResults() {
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [classFilter, setClassFilter] = useState('')
  const [form, setForm] = useState({
    studentId: '', examName: '', examType: 'unit-test', class: '', section: '',
    academicYear: new Date().getFullYear().toString(), remarks: '',
    marks: [{ subject: '', marksObtained: '', maxMarks: 100 }],
  })

  const fetchStudents = async () => {
    try { const { data } = await api.get('/students'); setStudents(data.students) } catch {}
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/results', { params: { class: classFilter || undefined } })
      setResults(data.results)
    } catch { toast.error('Failed to fetch results') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchStudents(); fetchResults() }, [classFilter])

  const addMark = () => setForm({ ...form, marks: [...form.marks, { subject: '', marksObtained: '', maxMarks: 100 }] })
  const removeMark = (i) => setForm({ ...form, marks: form.marks.filter((_, idx) => idx !== i) })
  const updateMark = (i, field, val) => {
    const updated = [...form.marks]
    updated[i][field] = val
    setForm({ ...form, marks: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/results', { ...form, marks: form.marks.map((m) => ({ ...m, marksObtained: Number(m.marksObtained), maxMarks: Number(m.maxMarks) })) })
      toast.success('Result uploaded successfully')
      setShowForm(false)
      setForm({ studentId: '', examName: '', examType: 'unit-test', class: '', section: '', academicYear: new Date().getFullYear().toString(), remarks: '', marks: [{ subject: '', marksObtained: '', maxMarks: 100 }] })
      fetchResults()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return
    try { await api.delete(`/results/${id}`); toast.success('Deleted'); fetchResults() }
    catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Results</h1>
          <p className="text-gray-500 text-sm">{results.length} results recorded</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Add Result</button>
      </div>

      <div className="flex gap-3 items-center">
        <label className="label mb-0 whitespace-nowrap">Filter by class:</label>
        <input className="input w-32" placeholder="e.g. 10" value={classFilter} onChange={(e) => setClassFilter(e.target.value)} />
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Exam', 'Type', 'Class', 'Marks', 'Percentage', 'Grade', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No results yet</td></tr>
              ) : results.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.student?.user?.name || '—'}</td>
                  <td className="px-4 py-3">{r.examName}</td>
                  <td className="px-4 py-3 capitalize"><span className="badge-blue">{r.examType}</span></td>
                  <td className="px-4 py-3">{r.class}-{r.section}</td>
                  <td className="px-4 py-3">{r.totalMarks}/{r.totalMaxMarks}</td>
                  <td className="px-4 py-3 font-medium">{r.percentage}%</td>
                  <td className="px-4 py-3"><span className={r.overallGrade === 'F' ? 'badge-red' : r.overallGrade === 'A+' || r.overallGrade === 'A' ? 'badge-green' : 'badge-yellow'}>{r.overallGrade}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Upload Result</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Student</label>
                <select className="input" required value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Select Student</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Exam Name</label><input className="input" required value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} /></div>
                <div>
                  <label className="label">Exam Type</label>
                  <select className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })}>
                    {['unit-test', 'midterm', 'final', 'quiz'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label">Class</label><input className="input" required value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} /></div>
                <div><label className="label">Section</label><input className="input" required value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Subject Marks</label>
                  <button type="button" onClick={addMark} className="text-xs text-indigo-600 hover:underline flex items-center gap-1"><Plus size={12} /> Add Subject</button>
                </div>
                <div className="space-y-3">
                  {form.marks.map((m, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <input className="input" placeholder="Subject" value={m.subject} onChange={(e) => updateMark(i, 'subject', e.target.value)} required />
                      <input type="number" className="input w-24" placeholder="Obtained" value={m.marksObtained} onChange={(e) => updateMark(i, 'marksObtained', e.target.value)} required min="0" />
                      <input type="number" className="input w-24" placeholder="Max" value={m.maxMarks} onChange={(e) => updateMark(i, 'maxMarks', e.target.value)} required min="1" />
                      {form.marks.length > 1 && (
                        <button type="button" onClick={() => removeMark(i)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div><label className="label">Remarks</label><textarea className="input resize-none" rows={2} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1"><Save size={15} className="inline mr-2" />{saving ? 'Saving...' : 'Save Result'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
