'use client'

import { useState, useEffect } from 'react'

interface Link {
  id: string
  originalUrl: string
  shortCode: string
  clicks: number
  lastClickedAt: string | null
  createdAt: string
}

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([])
  const [url, setUrl] = useState('')
  const [shortCode, setShortCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    setBaseUrl(window.location.origin)
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      const res = await fetch('/api/links')

      // Ensure response is JSON
      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        const text = await res.text()
        console.error('API returned non‑JSON:', text)
        throw new Error('Non‑JSON response')
      }

      // Handle HTTP errors
      if (!res.ok) {
        const errText = await res.text()
        console.error('API error:', errText)
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()
      setLinks(data)
    } catch (err) {
      console.error('Error fetching links:', err)
      setLinks([]) // keep UI usable
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          shortCode: shortCode || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create link')
        return
      }

      setSuccess(`Link created: ${baseUrl}/${data.shortCode}`)
      setUrl('')
      setShortCode('')
      fetchLinks()
    } catch (err) {
      setError('Failed to create link')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (code: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const res = await fetch(`/api/links/${code}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchLinks()
      }
    } catch (err) {
      console.error('Error deleting link:', err)
    }
  }

  const copyToClipboard = (code: string) => {
    const url = `${baseUrl}/${code}`
    navigator.clipboard.writeText(url)
    setSuccess('Link copied to clipboard!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const filteredLinks = links.filter(link =>
    link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Create and manage your short links</p>
      </div>

      {/* Create Link Form */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Create New Link</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-slate-300 mb-2">
              Original URL *
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label htmlFor="shortCode" className="block text-sm font-medium text-slate-300 mb-2">
              Custom Short Code (optional, 6-8 characters)
            </label>
            <input
              type="text"
              id="shortCode"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="mycode"
              pattern="[A-Za-z0-9]{6,8}"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-slate-500">Leave empty to generate automatically</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Short Link'}
          </button>
        </form>
      </div>

      {/* Links Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">Your Links</h2>
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:w-64"
            />
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-lg">No links found</p>
            <p className="text-sm mt-2">Create your first short link above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Short Code</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Target URL</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Clicked</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono font-medium"
                      >
                        /{link.shortCode}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md truncate text-slate-300" title={link.originalUrl}>
                        {link.originalUrl}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                      {link.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                      {link.lastClickedAt
                        ? new Date(link.lastClickedAt).toLocaleString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyToClipboard(link.shortCode)}
                          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          title="Copy link"
                        >
                          Copy
                        </button>
                        <a
                          href={`/code/${link.shortCode}`}
                          className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                        >
                          Stats
                        </a>
                        <button
                          onClick={() => handleDelete(link.shortCode)}
                          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
