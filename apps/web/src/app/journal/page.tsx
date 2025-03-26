'use client'

import { useState } from 'react'

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: entry }),
    })

    const data = await res.json()
    setResponse(data.result)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-4 py-24 font-sans">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">AI Journal</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-5 rounded-xl border border-gray-300 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all min-h-[140px]"
            placeholder="What’s on your mind today?"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Submit'}
          </button>
        </form>

        {response && (
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold mb-2">AI Insights</h2>
            <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{response}</p>
          </div>
        )}
      </div>
    </main>
  )
}