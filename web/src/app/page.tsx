'use client'


import WalletNav from '../components/WalletNav'
import VoteCard from '../components/VoteCard'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <WalletNav />
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
    </div>
  )
}
