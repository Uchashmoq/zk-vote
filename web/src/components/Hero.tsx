export default function Hero() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/30">
      <h1 className="text-3xl font-extrabold tracking-tight">Welcome to ZK Vote</h1>
      <p className="mt-3 text-slate-300 leading-relaxed">
        Connect your wallet on Sepolia to start exploring zero-knowledge voting flows.
        Choose MetaMask, Phantom, OKX Wallet, or any injected wallet to begin.
      </p>
    </div>
  )
}
