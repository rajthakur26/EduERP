import { useEffect, useState } from 'react'
import { UserCheck, BookOpen, FileText, Users } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../api/axios'
import StatCard from '../../components/common/StatCard'

export default function TeacherDashboard() {
  const { user } = useSelector((state) => state.auth)
  const [profile, setProfile] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, assignRes] = await Promise.all([
          api.get('/teachers/me'),
          api.get('/assignments'),
        ])
        setProfile(profileRes.data.teacher)
        setAssignments(assignRes.data.assignments)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>

  const activeAssignments = assignments.filter((a) => a.status === 'active')
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 text-sm">{profile?.department ? `${profile.department} Department` : 'Teacher Portal'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="My Subjects" value={profile?.subjects?.length || 0} icon={BookOpen} color="indigo" />
        <StatCard title="My Classes" value={profile?.classes?.length || 0} icon={Users} color="blue" />
        <StatCard title="Active Assignments" value={activeAssignments.length} icon={FileText} color="yellow" />
        <StatCard title="Total Submissions" value={totalSubmissions} icon={UserCheck} color="green" />
      </div>

      {/* Profile info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Profile Info</h3>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Employee ID', value: profile?.employeeId },
              { label: 'Department', value: profile?.department || '—' },
              { label: 'Qualification', value: profile?.qualification || '—' },
              { label: 'Experience', value: profile?.experience ? `${profile.experience} years` : '—' },
              { label: 'Subjects', value: profile?.subjects?.join(', ') || '—' },
              { label: 'Classes', value: profile?.classes?.join(', ') || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Recent assignments */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Assignments</h3>
          <div className="space-y-3">
            {assignments.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-gray-500">{a.subject} • Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={a.status === 'active' ? 'badge-green' : 'badge-red'}>{a.status}</span>
                  <p className="text-xs text-gray-500 mt-1">{a.submissions?.length || 0} submissions</p>
                </div>
              </div>
            ))}
            {assignments.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No assignments yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
