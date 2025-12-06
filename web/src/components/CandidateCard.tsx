'use client'

import Image from 'next/image'
import { useState } from 'react'

type Candidate = {
  name: string
  votes: number
  bio: string
  image: string
}

export default function CandidateCard({
  candidate,
  totalVotes,
  onVote,
}: {
  candidate: Candidate
  totalVotes: number
  onVote?: (name: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const percent =
    totalVotes === 0 ? 0 : Math.round((candidate.votes / Math.max(totalVotes, 1)) * 100)
  const barWidth = totalVotes === 0 ? '0%' : `${Math.max(6, (candidate.votes / totalVotes) * 100)}%`

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/40">
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800">
          <Image
            src={candidate.image}
            alt={candidate.name}
            fill
            sizes="56px"
            className="object-cover transition duration-200 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 break-words text-base font-semibold leading-tight text-slate-50">
                {candidate.name}
              </h3>
              <p className={`mt-1 text-sm text-slate-300 ${expanded ? '' : 'line-clamp-2'}`}>
                {candidate.bio}
              </p>
              {candidate.bio.length > 80 && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="mt-1 text-xs font-semibold text-cyan-300 underline-offset-4 hover:underline"
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
            style={{ width: barWidth }}
          />
        </div>
        <button
          onClick={() => onVote?.(candidate.name)}
          className="flex-shrink-0 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition duration-150 hover:brightness-110 active:translate-y-[1px]"
        >
          Vote
        </button>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span className="tabular-nums text-slate-100 font-semibold">{candidate.votes} votes</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
    </article>
  )
}
