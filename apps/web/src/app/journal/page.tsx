'use client'

import React, { useState, useEffect } from 'react'

type JournalEntry = {
  id: string  // Add unique ID for each entry
  prompt: string
  response: string
  createdAt: string
  isPinned?: boolean  // Optional pin status
  tags: string[]  // Add tags array
}

type ViewMode = 'list' | 'grid' | 'calendar'

export default function JournalPage() {
  const [entry, setEntry] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  // Debug current state
  useEffect(() => {
    console.log('Current entries state:', entries)
  }, [entries])

  // Load entries from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('journal-entries')
      console.log('Loading from localStorage:', saved)
      if (saved) {
        const parsedEntries = JSON.parse(saved)
        // Ensure all entries have IDs
        const entriesWithIds = parsedEntries.map((entry: JournalEntry) => ({
          ...entry,
          id: entry.id || crypto.randomUUID(),
          isPinned: entry.isPinned || false
        }))
        console.log('Parsed entries with IDs:', entriesWithIds)
        setEntries(entriesWithIds)
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [])

  // Save to localStorage when entries change
  useEffect(() => {
    if (entries.length > 0) {  // Only save if we have entries
      try {
        console.log('Attempting to save entries:', entries)
        localStorage.setItem('journal-entries', JSON.stringify(entries))
        console.log('Successfully saved to localStorage')
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [entries])

  // Load dark mode preference
  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true'
    setIsDarkMode(darkMode)
  }, [])

  // Apply dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem('dark-mode', isDarkMode.toString())
  }, [isDarkMode])

  // Get all unique tags from entries
  const allTags = Array.from(
    new Set(entries.flatMap(entry => entry.tags || []))
  ).sort()

  // Filter entries based on search and tags
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.response.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => entry.tags?.includes(tag))

    return matchesSearch && matchesTags
  })

  // Sort entries: pinned first, then by date
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: entry }),
      })

      const data = await res.json()
      setResponse(data.result)

      const newEntry: JournalEntry = {
        id: crypto.randomUUID(), // Generate unique ID
        prompt: entry,
        response: data.result,
        createdAt: new Date().toISOString(),
        isPinned: false,
        tags: []
      }

      setEntries(prevEntries => [newEntry, ...prevEntries])
      setEntry('')
    } catch (error) {
      console.error('Error submitting entry:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = entries.filter(e => e.id !== id)
      setEntries(updatedEntries)
      // Save directly to localStorage after deletion
      localStorage.setItem('journal-entries', JSON.stringify(updatedEntries))
    }
  }

  function handleEdit(entry: JournalEntry) {
    setEditingId(entry.id)
    setEditText(entry.prompt)
  }

  async function handleSaveEdit(id: string) {
    try {
      // Get new AI response for edited text
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: editText }),
      })

      const data = await res.json()

      setEntries(prevEntries =>
        prevEntries.map(e =>
          e.id === id
            ? {
                ...e,
                prompt: editText,
                response: data.result,
                createdAt: new Date().toISOString(), // Update timestamp
              }
            : e
        )
      )
      setEditingId(null)
      setEditText('')
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  function handleTogglePin(id: string) {
    setEntries(prevEntries =>
      prevEntries.map(e =>
        e.id === id ? { ...e, isPinned: !e.isPinned } : e
      )
    )
  }

  function handleAddTag(entryId: string, tag: string) {
    if (!tag.trim()) return
    setEntries(prevEntries =>
      prevEntries.map(e =>
        e.id === entryId
          ? { ...e, tags: [...(e.tags || []), tag.trim()] }
          : e
      )
    )
  }

  function handleRemoveTag(entryId: string, tagToRemove: string) {
    setEntries(prevEntries =>
      prevEntries.map(e =>
        e.id === entryId
          ? { ...e, tags: (e.tags || []).filter(tag => tag !== tagToRemove) }
          : e
      )
    )
  }

  return (
    <main className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold tracking-tight">AI Journal</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="bg-transparent border rounded-lg px-3 py-1"
            >
              <option value="list">List View</option>
              <option value="grid">Grid View</option>
              <option value="calendar">Calendar View</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className={`w-full p-5 rounded-xl border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-black'
              } shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[140px]`}
              placeholder="What's on your mind today?"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl transition-all ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-black hover:bg-gray-900'
              } text-white font-medium disabled:opacity-50`}
            >
              {loading ? 'Thinking...' : 'Submit'}
            </button>
          </form>

          {entries.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    multiple
                    value={selectedTags}
                    onChange={(e) =>
                      setSelectedTags(
                        Array.from(e.target.selectedOptions, option => option.value)
                      )
                    }
                    className={`px-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {allTags.map(tag => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`grid gap-6 ${
                viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'
              }`}>
                {sortedEntries.map((e) => (
                  <div
                    key={e.id}
                    className={`border rounded-xl p-4 ${
                      isDarkMode
                        ? e.isPinned
                          ? 'bg-yellow-900 border-yellow-800'
                          : 'bg-gray-800 border-gray-700'
                        : e.isPinned
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    } shadow-sm relative`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-500">
                        {new Date(e.createdAt).toLocaleString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePin(e.id)}
                          className="text-gray-500 hover:text-yellow-600"
                          title={e.isPinned ? 'Unpin' : 'Pin'}
                        >
                          📌
                        </button>
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 flex flex-wrap gap-2">
                      {e.tags?.map(tag => (
                        <span
                          key={tag}
                          className={`px-2 py-1 rounded-full text-sm ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(e.id, tag)}
                            className="ml-1 opacity-60 hover:opacity-100"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <form
                        onSubmit={(evt) => {
                          evt.preventDefault()
                          handleAddTag(e.id, newTag)
                          setNewTag('')
                        }}
                        className="inline-flex"
                      >
                        <input
                          type="text"
                          placeholder="Add tag..."
                          value={newTag}
                          onChange={(evt) => setNewTag(evt.target.value)}
                          className={`px-2 py-1 text-sm rounded-full ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        />
                      </form>
                    </div>

                    {editingId === e.id ? (
                      <div className="space-y-2">
                        <textarea
                          className={`w-full p-3 rounded-lg border ${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600'
                              : 'bg-white border-gray-300'
                          }`}
                          value={editText}
                          onChange={(evt) => setEditText(evt.target.value)}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(e.id)}
                            className={`px-3 py-1 rounded-lg ${
                              isDarkMode
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-black hover:bg-gray-800'
                            } text-white`}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null)
                              setEditText('')
                            }}
                            className={`px-3 py-1 rounded-lg ${
                              isDarkMode
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mb-2 whitespace-pre-wrap font-medium">
                          {e.prompt}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {e.response}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
} 