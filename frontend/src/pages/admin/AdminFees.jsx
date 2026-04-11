import { useEffect, useState } from 'react'
import { Plus, Search, X, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const STATUS_COLORS = { pending: 'badge-yellow', paid: 'badge-green', overdue: 'badge-red', partial: 'badge-blue' }
const EMPTY = { student: '', feeType: 'tuition', amount: '', dueDate: '', academicYear: new Date().getFullYear().toString(), month: '', remarks: '' }

export default function AdminFees() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const fetchFees = async () => {
    try {
      const { data } = await api.get('/fees', { params: { status: filterStatus || undefined } })
      setFees(data.fees)
    } catch { toast.error('Failed to fetch fees') }
    finally { setLoading(false) }
  }

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students')
      setStudents(data.students)
    } catch {}
  }

  useEffect(() => { fetchFees(); fetchStudents() }, [filterStatus])

  const handleCreate = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/fees', form)
      toast.success('Fee record created')
      setShowCreate(false); setForm(EMPTY); fetchFees()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const handleMarkPaid = async (id, amount) => {
    try {
      await api.put(`/fees/${id}`, { paidAmount: amount, paymentMethod: 'cash', status: 'paid', paidDate: new Date() })
      toast.success('Marked as paid')
      fetchFees()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 text-sm">{fees.length} fee records</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Fee</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['', 'pending', 'paid', 'overdue', 'partial'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${filterStatus === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'}`}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Student', 'Fee Type', 'Amount', 'Due Date', 'Paid', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : fees.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No fee records</td></tr>
              ) : fees.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{f.student?.user?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize">{f.feeType}</td>
                  <td className="px-4 py-3">₹{f.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(f.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">₹{f.paidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={STATUS_COLORS[f.status] || 'badge-blue'}>{f.status}</span></td>
                  <td className="px-4 py-3">
                    {f.status !== 'paid' && (
                      <button onClick={() => handleMarkPaid(f._id, f.amount)} className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                        <CheckCircle size={13} /> Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold">Create Fee Record</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Student</label>
                <select className="input" required value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })}>
                  <option value="">Select Student</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.user?.name} ({s.rollNumber})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fee Type</label>
                  <select className="input" value={form.feeType} onChange={(e) => setForm({ ...form, feeType: e.target.value })}>
                    {['tuition', 'transport', 'library', 'sports', 'other'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label">Amount (₹)</label><input type="number" className="input" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Due Date</label><input type="date" className="input" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
                <div><label className="label">Academic Year</label><input className="input" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} /></div>
              </div>
              <div><label className="label">Month</label><input className="input" placeholder="e.g. April" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Fee'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
