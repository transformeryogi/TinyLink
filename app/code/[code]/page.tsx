'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface LinkData {
    id: string
    originalUrl: string
    shortCode: string
    clicks: number
    lastClickedAt: string | null
    createdAt: string
    updatedAt: string
}

export default function StatsPage() {
    const params = useParams()
    const router = useRouter()
    const code = params.code as string

    const [link, setLink] = useState<LinkData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [baseUrl, setBaseUrl] = useState('')

    useEffect(() => {
        // Set base URL on client side only
        setBaseUrl(window.location.origin)
        fetchLinkStats()
    }, [code])

    const fetchLinkStats = async () => {
        try {
            const res = await fetch(`/api/links/${code}`)

            if (!res.ok) {
                setError('Link not found')
                setLoading(false)
                return
            }

            const data = await res.json()
            setLink(data)
        } catch (err) {
            setError('Failed to load link stats')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        const url = `${baseUrl}/${code}`
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading stats...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !link) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                        <p className="text-xl text-slate-400 mb-6">{error || 'Link not found'}</p>
                        <Link
                            href="/"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/"
                    className="text-blue-400 hover:text-blue-300 mb-4 inline-block transition-colors"
                >
                    ← Back to Dashboard
                </Link>
                <h1 className="text-4xl font-bold text-white mb-2">Link Statistics</h1>
                <p className="text-slate-400">Detailed analytics for your short link</p>
            </div>

            {/* Short Link Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-8 mb-8 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-blue-200 text-sm mb-2">Your Short Link</p>
                        <p className="text-white text-3xl font-bold font-mono">
                            {baseUrl ? `${baseUrl}/${code}` : `/${code}`}
                        </p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        disabled={!baseUrl}
                        className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Copy Link
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Total Clicks</p>
                            <p className="text-white text-4xl font-bold">{link.clicks}</p>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-lg">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Last Clicked</p>
                            <p className="text-white text-lg font-semibold">
                                {link.lastClickedAt
                                    ? new Date(link.lastClickedAt).toLocaleString()
                                    : 'Never'
                                }
                            </p>
                        </div>
                        <div className="bg-green-500/20 p-4 rounded-lg">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Details */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-2xl font-semibold text-white">Link Details</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Short Code</p>
                        <p className="text-white font-mono text-lg">{link.shortCode}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm mb-1">Target URL</p>
                        <a
                            href={link.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 break-all transition-colors"
                        >
                            {link.originalUrl}
                        </a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Created</p>
                            <p className="text-white">{new Date(link.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm mb-1">Last Updated</p>
                            <p className="text-white">{new Date(link.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Link Button */}
            <div className="mt-8 text-center">
                <a
                    href={`/${code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                    Test Redirect →
                </a>
            </div>
        </div>
    )
}
