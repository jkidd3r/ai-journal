'use client'

import React, { useState, useEffect } from 'react'

type JournalEntry = {
  prompt: string
  response: string
  createdAt: string
}

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])

  // Load entries from localStorage on first render
  useEffect(() => {
    const saved = localStorage.getItem('journal-entries')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage when entries change
  useEffect(() => {
    localStorage.setItem('journal-entries', JSON.stringify(entries))
  }, [entries])

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

    const newEntry: JournalEntry = {
      prompt: entry,
      response: data.result,
      createdAt: new Date().toISOString(),
    }

    setEntries([newEntry, ...entries])
    setEntry('')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center px-4 py-24 font-sans">
      <div className="w-full max-w-2xl space-y-10">
        <h1 className="text-4xl font-semibold tracking-tight">AI Journal</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-5 rounded-xl border border-gray-300 bg-white shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black min-h-[140px]"
            placeholder="What's on your mind today?"
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

        {entries.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Previous Entries</h2>
            {entries.map((e, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm"
              >
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
                <p className="mb-2 whitespace-pre-wrap font-medium">{e.prompt}</p>
                <p className="text-gray-700 whitespace-pre-wrap">{e.response}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  )
} 