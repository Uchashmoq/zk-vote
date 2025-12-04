'use client'

import Hero from '../components/Hero'
import WalletNav from '../components/WalletNav'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <WalletNav />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Hero />
      </main>
    </div>
  )
}
