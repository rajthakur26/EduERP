import { useEffect, useState } from 'react'
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import api from '../../api/axios'

const STATUS_ICON = { paid: CheckCircle, pending: Clock, overdue: AlertCircle, partial: Clock }
const STATUS_COLOR = { paid: 'text-green-600 bg-green-50', pending: 'text-yellow-600 bg-yellow-50', overdue: 'text-red-600 bg-red-50', partial: 'text-blue-600 bg-blue-50' }

export default function MyFees() {
  const [fees, setFees] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/fees/me').then(({ data }) => { setFees(data.fees); setSummary(data.summary) }).catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
        <p className="text-gray-500 text-sm">Fee payment history and status</p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Billed', value: `₹${summary.total?.toLocaleString()}`, color: 'bg-gray-50' },
            { label: 'Paid', value: `₹${summary.paid?.toLocaleString()}`, color: 'bg-green-50' },
            { label: 'Pending', value: `₹${summary.pending?.toLocaleString()}`, color: summary.pending > 0 ? 'bg-red-50' : 'bg-green-50' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-4 text-center`}>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
        ) : fees.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No fee records found</div>
        ) : fees.map((f) => {
          const Icon = STATUS_ICON[f.status] || Clock
          return (
            <div key={f._id} className="card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <DollarSign size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold capitalize">{f.feeType} Fee</p>
                  <p className="text-sm text-gray-500">Due: {new Date(f.dueDate).toLocaleDateString()} {f.month ? `• ${f.month}` : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{f.amount.toLocaleString()}</p>
                {f.paidAmount > 0 && f.paidAmount < f.amount && (
                  <p className="text-xs text-gray-500">Paid: ₹{f.paidAmount.toLocaleString()}</p>
                )}
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${STATUS_COLOR[f.status]}`}>
                  <Icon size={11} /> {f.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
