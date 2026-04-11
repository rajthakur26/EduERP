import { useState } from 'react'
import { Send, X } from 'lucide-react'
import api from '../../api/axios'
import { toast } from 'react-toastify'

export default function AdminNotifications() {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', recipientRole: 'all', link: '' })
  const [sending, setSending] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault(); setSending(true)
    try {
      await api.post('/notifications', form)
      toast.success('Notification sent!')
      setForm({ title: '', message: '', type: 'info', recipientRole: 'all', link: '' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send') }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Send Notifications</h1>
        <p className="text-gray-500 text-sm">Broadcast real-time notifications to users</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-5">New Notification</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" required placeholder="Notification title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input resize-none" rows={4} required placeholder="Enter your message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {['info', 'success', 'warning', 'error'].map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Send To</label>
              <select className="input" value={form.recipientRole} onChange={(e) => setForm({ ...form, recipientRole: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="student">All Students</option>
                <option value="teacher">All Teachers</option>
                <option value="admin">Admins Only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Link (optional)</label>
            <input className="input" placeholder="https://..." value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </div>
          <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 w-full justify-center py-3">
            <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'All Users', desc: 'Sends to every role', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'Students Only', desc: 'Only student accounts', color: 'bg-green-50 text-green-700' },
          { label: 'Teachers Only', desc: 'Only teacher accounts', color: 'bg-blue-50 text-blue-700' },
        ].map((c) => (
          <div key={c.label} className={`p-4 rounded-xl ${c.color}`}>
            <p className="font-semibold text-sm">{c.label}</p>
            <p className="text-xs mt-1 opacity-75">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
