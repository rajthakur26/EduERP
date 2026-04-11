import { useEffect, useState } from 'react'
import api from '../../api/axios'

const STATUS_STYLE = { present: 'badge-green', absent: 'badge-red', late: 'badge-yellow', excused: 'badge-blue' }

export default function MyAttendance() {
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/attendance/me', { params: { month, year } })
      setRecords(data.records)
      setStats(data.stats)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAttendance() }, [month, year])

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm">Track your attendance records</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="label">Month</label>
          <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Year</label>
          <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Days', value: stats.total, color: 'bg-gray-50' },
            { label: 'Present', value: stats.present, color: 'bg-green-50' },
            { label: 'Absent', value: stats.absent, color: 'bg-red-50' },
            { label: 'Percentage', value: `${stats.percentage}%`, color: stats.percentage >= 75 ? 'bg-green-50' : 'bg-red-50' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`${color} rounded-xl p-4 text-center`}>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Attendance bar */}
      {stats && stats.total > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Attendance Rate</span>
            <span className={stats.percentage >= 75 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{stats.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className={`h-3 rounded-full transition-all ${stats.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min(stats.percentage, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-2">{stats.percentage < 75 ? '⚠️ Below minimum 75% requirement' : '✅ Meeting attendance requirement'}</p>
        </div>
      )}

      {/* Records table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Date', 'Subject', 'Status', 'Remarks'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No records for this period</td></tr>
              ) : records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3">{r.subject}</td>
                  <td className="px-4 py-3"><span className={STATUS_STYLE[r.status] || 'badge-blue'}>{r.status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
