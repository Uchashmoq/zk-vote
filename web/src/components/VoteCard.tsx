'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProgressRing from './ProgressRing'

type Candidate = {
  name: string
  votes: number
}

const pollCover = '/poll-cover.svg'
const pollTitle =
  'What is your favorite fruit? This is a deliberately long poll title to verify truncation behaves well on narrow screens.'
const contractAddress = '0x1234567890abcdef1234567890abcdef12345678'

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
    <Link
      href={`/vote/${contractAddress}`}
      className="group block rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 transition duration-200 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/40 focus-visible:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      aria-label={`Open poll ${pollTitle}`}
    >
      <section>
        <div className="flex justify-items-normal gap-4 sm:gap-6">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
            <Image
              src={pollCover}
              alt="Poll cover"
              fill
              sizes="64px"
              className="h-14 w-14 object-cover transition duration-200 group-hover:scale-[1.03]"
              priority
            />
          </div>
          <div className="min-w-0 flex flex-col gap-3 flex-1">
            <h2
              className="truncate text-md font-semibold leading-tight text-slate-50 sm:text-md"
              title={pollTitle}
            >
              {pollTitle}
            </h2>
            <p className="text-xs text-slate-300">TOTAL VOTES {totalVotes}</p>
          </div>
          <div className="hidden shrink-0 flex-col items-center gap-1 min-[430px]:flex">
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
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-[width] duration-300 ease-out group-hover:brightness-110"
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
    </Link>
  )
}
