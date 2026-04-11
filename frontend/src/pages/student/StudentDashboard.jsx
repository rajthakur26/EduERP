import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { UserCheck, FileText, DollarSign, BookOpen, TrendingUp } from 'lucide-react'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'

export default function StudentDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [data, setData] = useState({ attendance: null, fees: null, results: [], assignments: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [attRes, feeRes, resultRes, assignRes] = await Promise.all([
          api.get('/attendance/me'),
          api.get('/fees/me'),
          api.get('/results/me'),
          api.get('/assignments'),
        ])
        setData({
          attendance: attRes.data.stats,
          fees: feeRes.data.summary,
          results: resultRes.data.results,
          assignments: assignRes.data.assignments,
        })
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>

  const latestResult = data.results[0]
  const pendingFees = data.fees?.pending || 0
  const activeAssignments = data.assignments.filter((a) => a.status === 'active').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 text-sm">Here's your academic summary</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Attendance" value={`${data.attendance?.percentage || 0}%`} subtitle={`${data.attendance?.present || 0} / ${data.attendance?.total || 0} days`} icon={UserCheck} color={data.attendance?.percentage >= 75 ? 'green' : 'red'} />
        <StatCard title="Latest Result" value={latestResult ? `${latestResult.percentage}%` : 'N/A'} subtitle={latestResult?.examName || 'No exams yet'} icon={FileText} color="blue" />
        <StatCard title="Pending Fees" value={`₹${pendingFees.toLocaleString()}`} subtitle={`Paid: ₹${(data.fees?.paid || 0).toLocaleString()}`} icon={DollarSign} color={pendingFees > 0 ? 'yellow' : 'green'} />
        <StatCard title="Active Assignments" value={activeAssignments} subtitle="due soon" icon={BookOpen} color="purple" />
      </div>

      {/* Attendance alert */}
      {data.attendance?.percentage < 75 && data.attendance?.total > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">Low Attendance Warning</p>
            <p className="text-red-600 text-xs mt-0.5">Your attendance is {data.attendance?.percentage}%. Minimum required is 75%.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Recent Results</h3>
          <div className="space-y-3">
            {data.results.slice(0, 4).map((r) => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.examName}</p>
                  <p className="text-xs text-gray-400 capitalize">{r.examType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{r.percentage}%</p>
                  <span className={r.overallGrade === 'F' ? 'badge-red' : 'badge-green'}>{r.overallGrade}</span>
                </div>
              </div>
            ))}
            {data.results.length === 0 && <p className="text-center text-gray-400 py-4 text-sm">No results yet</p>}
          </div>
        </div>

        {/* Active Assignments */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><BookOpen size={16} /> Active Assignments</h3>
          <div className="space-y-3">
            {data.assignments.filter((a) => a.status === 'active').slice(0, 4).map((a) => (
              <div key={a._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-gray-400">{a.subject} • Class {a.class}-{a.section}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Due</p>
                  <p className="text-xs font-medium text-red-600">{new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {activeAssignments === 0 && <p className="text-center text-gray-400 py-4 text-sm">No active assignments</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
