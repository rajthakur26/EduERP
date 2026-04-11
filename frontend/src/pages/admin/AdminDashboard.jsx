import { useEffect, useState } from 'react'
import { Users, GraduationCap, DollarSign, UserCheck, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [feeData, setFeeData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, feeRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/fees'),
        ])
        setStats(statsRes.data.stats)
        setFeeData(feeRes.data.data.slice(-6).map((d) => ({
          name: `${d._id.month}/${d._id.year}`,
          Billed: d.totalAmount,
          Collected: d.collected,
        })))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>

  const attendanceData = stats?.attendanceToday?.map((a) => ({ name: a._id, value: a.count })) || []
  const feeStats = stats?.fees || { totalAmount: 0, totalCollected: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={stats?.totalStudents || 0} icon={GraduationCap} color="indigo" />
        <StatCard title="Total Teachers" value={stats?.totalTeachers || 0} icon={Users} color="blue" />
        <StatCard title="Fees Collected" value={`₹${(feeStats.totalCollected / 1000).toFixed(1)}K`} subtitle={`of ₹${(feeStats.totalAmount / 1000).toFixed(1)}K billed`} icon={DollarSign} color="green" />
        <StatCard title="Attendance Today" value={`${attendanceData.find(a => a.name === 'present')?.value || 0}`} subtitle="students present" icon={UserCheck} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Fee Collection (Last 6 Months)</h3>
          {feeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={feeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="Billed" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Collected" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No fee data yet</div>
          )}
        </div>

        {/* Attendance pie */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Today's Attendance</h3>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No attendance data</div>
          )}
        </div>
      </div>

      {/* Recent students */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Recently Added Students</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats?.recentStudents || []).map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="py-3 font-medium">{s.user?.name}</td>
                  <td className="py-3 text-gray-500">{s.user?.email}</td>
                  <td className="py-3"><span className={s.user?.isActive ? 'badge-green' : 'badge-red'}>{s.user?.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
              {(!stats?.recentStudents || stats.recentStudents.length === 0) && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400">No students yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
