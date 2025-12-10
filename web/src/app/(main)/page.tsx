'use client'

import { useEffect, useState } from 'react'
import { CircleStar, Eye, EyeOff, Search, ShieldCheck } from 'lucide-react'
import VoteCard from '@/components/VoteCard'



export default function HomePage() {
  const [showVerified, setShowVerified] = useState(true)
  const [hideEnded, setHideEnded] = useState(false)
  const [hideNotStarted, setHideNotStarted] = useState(false)
  const [committedOnly, setCommittedOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [queryInput, setQueryInput] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setQuery(queryInput.trim()), 250)
    return () => window.clearTimeout(timeoutId)
  }, [queryInput])


  return (
    <main className="mx-auto max-w-5xl px-6 py-6">
      <div className="mb-6 flex flex-row gap-3 justify-between">
        <div className="flex w-100 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 shadow-inner shadow-black/20 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-cyan-400/40">
          <Search className="h-4 w-4 text-slate-400" aria-hidden />
          <input
            type="search"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Search title, address..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        {/* TODO 修复，没有点击filter按钮，点击filter按钮附近的地方下拉列表也会弹出来 */}
        <div className="dropdown z-2">
          <button
            type="button"
            tabIndex={0}
            className="btn btn-sm rounded-md border border-white/5 bg-white/5 px-4 text-sm font-semibold text-slate-100 hover:border-white/20 hover:bg-white/10"
          >
            Filters
          </button>
          <ul
            tabIndex={-1}
            className="dropdown-content z-1 mt-2 flex w-64 flex-col gap-1 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur"
          >
            <li>
              <button
                type="button"
                onClick={() => setShowVerified((prev) => !prev)}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {showVerified ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden />
                ) : (
                  <EyeOff className="h-4 w-4 text-slate-400" aria-hidden />
                )}
                {showVerified ? 'Verified only' : 'All votes'}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setHideEnded((prev) => !prev)}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {hideEnded ? (
                  <EyeOff className="h-4 w-4 text-amber-400" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" aria-hidden />
                )}
                {hideEnded ? 'Hide ended' : 'Show ended'}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setHideNotStarted((prev) => !prev)}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {hideNotStarted ? (
                  <EyeOff className="h-4 w-4 text-amber-400" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4 text-slate-400" aria-hidden />
                )}
                {hideNotStarted ? 'Hide upcoming' : 'Show upcoming'}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setCommittedOnly((prev) => !prev)}
                className="inline-flex w-full items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                {committedOnly ? (
                  <CircleStar className="h-4 w-4 text-emerald-400" aria-hidden />
                ) : (
                  <CircleStar className="h-4 w-4 text-slate-400" aria-hidden />
                )}
                {committedOnly ? 'Committed only' : 'Any commitment'}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <VoteCard />
          <VoteCard /><VoteCard /><VoteCard /><VoteCard /><VoteCard /><VoteCard /><VoteCard /><VoteCard />
        </div>
      </div>
    </main>
  )
}
