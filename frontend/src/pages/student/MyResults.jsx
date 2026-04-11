import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import api from '../../api/axios'

export default function MyResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/results/me').then(({ data }) => setResults(data.results)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const gradeColor = (g) => {
    if (g === 'A+' || g === 'A') return 'text-green-600 bg-green-50'
    if (g === 'B') return 'text-blue-600 bg-blue-50'
    if (g === 'C') return 'text-yellow-600 bg-yellow-50'
    if (g === 'D') return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-500 text-sm">{results.length} exam results</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>
      ) : results.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No results published yet</div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.examName}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="badge-blue capitalize">{r.examType}</span>
                    <span className="text-xs text-gray-400">{r.academicYear}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{r.percentage}%</p>
                    <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${gradeColor(r.overallGrade)}`}>{r.overallGrade}</span>
                  </div>
                  <button onClick={() => setExpanded(expanded === r._id ? null : r._id)} className="p-2 hover:bg-gray-100 rounded-lg">
                    {expanded === r._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${r.percentage >= 75 ? 'bg-green-500' : r.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${r.percentage}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">{r.totalMarks} / {r.totalMaxMarks} marks</p>
              </div>

              {expanded === r._id && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-medium text-sm mb-3 text-gray-700">Subject-wise Breakdown</h4>
                  <div className="space-y-2">
                    {r.marks?.map((m, i) => {
                      const pct = ((m.marksObtained / m.maxMarks) * 100).toFixed(1)
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-28 shrink-0">{m.subject}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-20 text-right">{m.marksObtained}/{m.maxMarks} ({pct}%)</span>
                        </div>
                      )
                    })}
                  </div>
                  {r.remarks && <p className="mt-3 text-sm text-gray-500 italic">Remarks: {r.remarks}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
