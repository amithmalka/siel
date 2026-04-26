'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ForumPost {
  id: string
  anonymous_handle: string
  title: string
  content: string
  category: string
  reply_count: number
  created_at: string
}

const CATEGORIES = ['כללי', 'שאלות', 'חוויות', 'תמיכה', 'עצות']

export default function AdminForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('כללי')
  const [posting, setPosting] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/forum')
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deletePost(id: string, title: string) {
    if (!confirm(`למחוק את הפוסט "${title}"? פעולה זו בלתי הפיכה.`)) return
    setDeletingId(id)
    await fetch('/api/admin/forum', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    await load()
    setDeletingId(null)
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) return
    setPosting(true)
    await fetch('/api/admin/forum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), content: newContent.trim(), category: newCategory }),
    })
    setNewTitle('')
    setNewContent('')
    setNewCategory('כללי')
    setShowForm(false)
    setPosting(false)
    await load()
  }

  return (
    <main className="min-h-screen bg-cream p-8" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-textMuted hover:text-pink text-sm">← חזרה לדשבורד</Link>
            <h1 className="text-2xl font-bold text-oak">💬 ניהול פוסטים בקהילה</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
          >
            {showForm ? 'ביטול' : '+ פרסם כ-SIEL'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={submitPost} className="bg-white border border-purple-200 rounded-2xl p-6 mb-6 space-y-4">
            <h2 className="font-bold text-textMain">פוסט חדש בשם SIEL</h2>
            <div>
              <label className="text-xs text-textMuted block mb-1">קטגוריה</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-beige rounded-xl px-3 py-2 text-sm bg-white"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">כותרת</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="w-full border border-beige rounded-xl px-3 py-2 text-sm"
                placeholder="כותרת הפוסט"
              />
            </div>
            <div>
              <label className="text-xs text-textMuted block mb-1">תוכן</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                rows={4}
                className="w-full border border-beige rounded-xl px-3 py-2 text-sm resize-none"
                placeholder="תוכן הפוסט..."
              />
            </div>
            <button
              type="submit"
              disabled={posting}
              className="px-6 py-2 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {posting ? 'מפרסם...' : 'פרסם'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="text-center text-textMuted py-16">טוען...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-textMuted py-16">אין פוסטים</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-beige rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${post.anonymous_handle === 'SIEL' ? 'text-purple-600' : 'text-pink'}`}>{post.anonymous_handle}</span>
                      <span className="text-xs text-textMuted">{new Date(post.created_at).toLocaleDateString('he-IL')}</span>
                      <span className="text-xs bg-beige text-textMuted rounded-full px-2 py-0.5">{post.reply_count} תגובות</span>
                    </div>
                    <div className="font-bold text-textMain mb-1">{post.title}</div>
                    <div className="text-sm text-textMuted line-clamp-2">{post.content}</div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id, post.title)}
                    disabled={deletingId === post.id}
                    className="shrink-0 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-xl px-3 py-1.5 transition-colors disabled:opacity-40"
                  >
                    {deletingId === post.id ? '...' : '🗑 מחק'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
