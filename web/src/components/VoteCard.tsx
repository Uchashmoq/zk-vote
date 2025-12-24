'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProgressRing from './ProgressRing'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { getAllCandidates, getVoteTime } from '@/actions'
import { Candidate, stringToVoteMeta, VoteMeta } from '@/types'


export default function VoteCard(props: { address: string, meta: string }) {
  return (
    <Suspense fallback={<VoteCardSkeleton />}>
      <VoteCardContent {...props} />
    </Suspense>
  )
}

function VoteCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="h-16 w-16 rounded-2xl bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-1/3 rounded bg-white/10" />
        </div>
        <div className="hidden min-[430px]:flex flex-col items-center gap-2">
          <div className="h-14 w-14 rounded-full bg-white/10" />
          <div className="h-2 w-16 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-28 h-3 rounded bg-white/10" />
            <div className="flex-1 h-3 rounded-full bg-white/10" />
            <div className="w-12 h-3 rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  )
}


function VoteCardContent({ address, meta }: { address: string, meta: string }) {
  const voteMeta = stringToVoteMeta(meta)
  const [voteTime, setVoteTime] = useState<{ startTime: BigInt; endTime: BigInt }>()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getVoteTime(address), getAllCandidates(address)])
      .then(([vt, cs]) => {
        if (cancelled) return
        setVoteTime(vt)
        setCandidates(cs)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [address])



  const sorted = useMemo(() => [...candidates].sort((a, b) => b.votes - a.votes), [candidates])
  const totalVotes = useMemo(() => sorted.reduce((sum, c) => sum + c.votes, 0), [sorted])

  const start = voteTime ? Number(voteTime.startTime) : undefined
  const end = voteTime ? Number(voteTime.endTime) : undefined
  const [progressPercent, setProgressPercent] = useState(0)
  const [statusLabel, setStatusLabel] = useState<'UPCOMING' | 'IN PROGRESS' | 'ENDED'>('UPCOMING')

  useEffect(() => {
    if (start === undefined || end === undefined || end <= start) {
      setProgressPercent(0)
      setStatusLabel('UPCOMING')
      return
    }

    const updateProgress = () => {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const percent = Math.min(
        100,
        Math.max(0, Math.round(((nowSeconds - start) / (end - start)) * 100))
      )
      setProgressPercent(percent)
      setStatusLabel(nowSeconds >= end ? 'ENDED' : nowSeconds < start ? 'UPCOMING' : 'IN PROGRESS')
    }

    updateProgress()
    const timer = setInterval(updateProgress, 1000)
    return () => clearInterval(timer)
  }, [start, end])

  if (loading) {
    return <VoteCardSkeleton />
  }

  return (
    <Link
      href={`/vote/${address}`}
      className="group block rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/30 transition duration-200 hover:-translate-y-[2px] hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/40 focus-visible:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      aria-label={`Open poll ${voteMeta.title}`}
    >
      <section>
        <div className="flex justify-items-normal gap-4 sm:gap-6">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-800">
            <Image
              src={voteMeta.imageUrl || '/imgNotfound.png'}
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
              title={voteMeta.title}
            >
              {voteMeta.title}
            </h2>

            <p className="text-xs text-slate-300">TOTAL VOTES {totalVotes}</p>
          </div>
          <div className="hidden shrink-0 flex-col items-center gap-1 min-[430px]:flex">
            <ProgressRing percent={progressPercent} />
            <div className="relative text-[11px] uppercase tracking-[0.2em] text-slate-400">
              <span className={`relative z-1 ${statusLabel === 'IN PROGRESS' ? "animate-pulse" : ""}`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {sorted.map((candidate) => {
            const width =
              totalVotes === 0 ? '0%' : `${Math.max(6, (candidate.votes / totalVotes) * 100)}%`
            return (
              <div
                key={candidate.meta.name}
                className="flex items-center gap-3 rounded-xl bg-white/0 px-2 py-1 transition hover:bg-white/5"
              >
                <div className="w-28 min-w-0 truncate text-sm font-medium text-slate-100">
                  {candidate.meta.name}
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
