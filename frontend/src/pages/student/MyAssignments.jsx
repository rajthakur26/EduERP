import { useEffect, useState } from 'react'
import { Upload, Clock, CheckCircle, X } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

export default function MyAssignments() {
  const { user } = useSelector((state) => state.auth)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [submitNote, setSubmitNote] = useState('')

  const fetchAssignments = async () => {
    try { const { data } = await api.get('/assignments'); setAssignments(data.assignments) }
    catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleSubmit = async (assignmentId) => {
    try {
      await api.post(`/assignments/${assignmentId}/submit`, { fileUrl: submitNote || 'submitted' })
      toast.success('Assignment submitted!')
      setSubmitting(null); setSubmitNote('')
      fetchAssignments()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const isOverdue = (dueDate) => new Date(dueDate) < new Date()
  const isSubmitted = (a) => a.submissions?.some((s) => s.student === user?._id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-500 text-sm">{assignments.filter((a) => a.status === 'active').length} active assignments</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : assignments.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No assignments yet</div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const overdue = isOverdue(a.dueDate)
            const submitted = isSubmitted(a)
            const mySubmission = a.submissions?.find((s) => s.student === user?._id)

            return (
              <div key={a._id} className={`card border-l-4 ${submitted ? 'border-l-green-500' : overdue ? 'border-l-red-500' : 'border-l-indigo-500'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{a.title}</h3>
                      <span className={a.status === 'active' ? 'badge-green' : 'badge-red'}>{a.status}</span>
                      {submitted && <span className="badge-blue flex items-center gap-1"><CheckCircle size={11} /> Submitted</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{a.subject} • Class {a.class}-{a.section}</p>
                    {a.description && <p className="text-sm text-gray-500 mt-2">{a.description}</p>}
                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <Clock size={12} className={overdue ? 'text-red-500' : 'text-gray-400'} />
                      <span className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
                        Due: {new Date(a.dueDate).toLocaleString()} {overdue && '(Overdue)'}
                      </span>
                    </div>
                    {mySubmission?.grade && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
                        <p className="font-medium text-green-800">Graded: {mySubmission.marks}/{a.maxMarks} — Grade: {mySubmission.grade}</p>
                        {mySubmission.feedback && <p className="text-green-600 mt-1">{mySubmission.feedback}</p>}
                      </div>
                    )}
                  </div>

                  {a.status === 'active' && !submitted && (
                    <div>
                      {submitting === a._id ? (
                        <div className="flex flex-col gap-2 min-w-48">
                          <input className="input text-sm" placeholder="Notes / link to work" value={submitNote} onChange={(e) => setSubmitNote(e.target.value)} />
                          <div className="flex gap-2">
                            <button onClick={() => handleSubmit(a._id)} className="btn-primary text-xs flex-1">Submit</button>
                            <button onClick={() => setSubmitting(null)} className="p-1.5 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setSubmitting(a._id)} className="flex items-center gap-1.5 text-sm text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-lg">
                          <Upload size={14} /> Submit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
