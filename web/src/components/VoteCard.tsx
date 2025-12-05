'use client'

import Image from 'next/image'

type Candidate = {
  name: string
  votes: number
}

const pollCover = 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg'
const pollTitle =
  'What is your favorite fruit? This is a deliberately long poll title to verify truncation behaves well on narrow screens.'

const candidates: Candidate[] = [
  { name: 'Apple', votes: 38 },
  { name: 'Banana', votes: 33 },
  { name: 'Grape', votes: 22 },
]

const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0)
const voteGoal = 120
const progressPercent = Math.min(100, Math.round((totalVotes / voteGoal) * 100))

export default function VoteCard() {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes)

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 transition hover:border-white/20 hover:bg-white/10">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
          <Image
            src={pollCover}
            alt="Poll cover"
            fill
            sizes="64px"
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-xl font-semibold leading-tight text-slate-50 sm:text-2xl"
            title={pollTitle}
          >
            {pollTitle}
          </h2>
          <p className="text-sm text-slate-300">TOTAL VOTES {totalVotes}</p>
        </div>
        <div className="hidden flex-shrink-0 flex-col items-center gap-1 min-[430px]:flex">
          <ProgressRing percent={progressPercent} />
          <div className="relative text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <span className="relative z-10 animate-pulse">IN PROGRESS</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {sorted.map((candidate) => {
          const width =
            totalVotes === 0 ? '0%' : `${Math.max(6, (candidate.votes / totalVotes) * 100)}%`
          return (
            <div
              key={candidate.name}
              className="flex items-center gap-3 rounded-xl bg-white/0 px-2 py-1 transition hover:bg-white/5"
            >
              <div className="w-28 min-w-0 truncate text-sm font-medium text-slate-100">
                {candidate.name}
              </div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                  style={{ width }}
                />
              </div>
              <div className="w-12 text-right text-sm font-semibold text-slate-50 tabular-nums">
                {candidate.votes}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ProgressRing({ percent }: { percent: number }) {
  const clamped = Math.min(100, Math.max(0, percent))
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 64 64" className="relative z-10 h-16 w-16">
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
          fill="none"
        />
        {/* 主进度环 */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        {/* 闪烁高光环 */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          stroke="url(#ringGradientBright)"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="animate-pulse opacity-50"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="ringGradientBright" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="pointer-events-none absolute inset-1 grid place-items-center rounded-full bg-slate-950 text-[11px] font-semibold text-slate-50">
        <span className="animate-pulse">
          {clamped}%
        </span>
      </div>
    </div>
  )
}