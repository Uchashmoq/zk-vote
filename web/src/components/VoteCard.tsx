'use client'

import Image from 'next/image'
import Link from 'next/link'
import ProgressRing from './ProgressRing'
import { useEffect, useState } from 'react'
import { getAllCandidates, getVoteTime } from '@/actions'

type Candidate = {
  votes: number
  meta: string
}

const pollCover = '/poll-cover.svg'

export default function VoteCard({ address, meta }: { address: string, meta: string }) {
  type VoteMeta = { title: string, description: string, imageUrl: string, imageCid: string }
  const fallbackMeta: VoteMeta = { title: '???', description: '???', imageUrl: '???', imageCid: '???' }
  const voteMeta: VoteMeta = (() => {
    try {
      const parsed = JSON.parse(meta) as Partial<VoteMeta>
      return {
        title: typeof parsed?.title === 'string' ? parsed.title : fallbackMeta.title,
        description: typeof parsed?.description === 'string' ? parsed.description : fallbackMeta.description,
        imageUrl: typeof parsed?.imageUrl === 'string' ? parsed.imageUrl : fallbackMeta.imageUrl,
        imageCid: typeof parsed?.imageCid === 'string' ? parsed.imageCid : fallbackMeta.imageCid,
      }
    } catch {
      return fallbackMeta
    }
  })();
  const [voteTime, setVoteTime] = useState<{ startTime: BigInt; endTime: BigInt }>()
  const [candidates, setCandidates] = useState<Candidate[]>([])

  useEffect(() => {
    getVoteTime(address).then(setVoteTime)
  }, [address])

  useEffect(() => {
    getAllCandidates(address).then(setCandidates)
  }, [address])

  const parsedCandidates = candidates.map((candidate, index) => {
    const fallbackName = `Candidate ${index + 1}`
    const fallbackBio = ''
    try {
      const parsed = JSON.parse(candidate.meta) as Partial<{
        name: string
        notes: string
      }>
      return {
        ...candidate,
        name:
          typeof parsed?.name === 'string' && parsed.name.trim()
            ? parsed.name
            : fallbackName,
        bio:
          typeof parsed?.notes === 'string' && parsed.notes.trim()
            ? parsed.notes
            : fallbackBio,
      }
    } catch {
      return { ...candidate, name: fallbackName, bio: fallbackBio }
    }
  })

  const sorted = [...parsedCandidates].sort((a, b) => b.votes - a.votes)
  const totalVotes = sorted.reduce((sum, c) => sum + c.votes, 0)

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
              src={voteMeta.imageUrl}
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
