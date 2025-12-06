'use client'

import { useState } from 'react'
import { EyeOff, ShieldCheck } from 'lucide-react'
import VoteCard from '@/components/VoteCard'

export default function HomePage() {
  const [showVerified, setShowVerified] = useState(true)

  return (
    <>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <VoteCard />
            <VoteCard />
            <VoteCard />
            <VoteCard />
            <VoteCard />
            <VoteCard />
            <VoteCard />
            <VoteCard />
          </div>
        </div>
      </main>
      <div className="fixed bottom-6 right-6 z-30">
        <VerifiedToggle showVerified={showVerified} setShowVerified={setShowVerified} />
      </div>
    </>
  )
}

function VerifiedToggle(props: { showVerified: boolean; setShowVerified: (v: boolean) => void }) {
  const { showVerified, setShowVerified } = props
  return (
    <button
      onClick={() => setShowVerified((v) => !v)}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 shadow-lg shadow-black/40 backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      aria-pressed={showVerified}
      aria-label={showVerified ? 'Hide verified polls' : 'Show verified polls'}
      title={showVerified ? 'Hide verified polls' : 'Show verified polls'}
    >
      {showVerified ? (
        <ShieldCheck className="h-5 w-5 text-emerald-300" strokeWidth={2.2} />
      ) : (
        <EyeOff className="h-5 w-5 text-slate-300" strokeWidth={2.2} />
      )}
    </button>
  )
}
