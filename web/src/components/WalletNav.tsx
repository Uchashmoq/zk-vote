'use client'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Connector, useAccount, useChainId, useChains, useConnect, useDisconnect } from 'wagmi'

function shorten(addr?: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function SearchBar() {
  return (
    <div className="relative flex w-full min-w-[180px] max-w-lg items-center">
      <input
        value=""
        readOnly
        placeholder="Search for vote"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
      />
      <Search className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" strokeWidth={2} />
    </div>
  )
}

function RightActions() {
  const { status, address } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()

  if (status === 'connecting' || status === 'reconnecting') {
    return (
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200">Connecting...</div>
        <button
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 opacity-70"
          disabled
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  if (status === 'connected' && address) {
    return (
      <div className="relative flex items-center gap-3">
        <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200">
          {shorten(address)}
        </div>
        <div className="flex items-center gap-2">

          <button
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20 disabled:opacity-70"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <ConnectorMenu />
  )
}

export default function WalletNav({ showSearchBar }: { showSearchBar: boolean }) {
  return (
    <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
        <div className="hidden sm:block">
          <Brand />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {showSearchBar && <SearchBar />}
        </div>
        <RightActions />
      </div>
    </nav>
  )
}

function Brand() {

  const chainId = useChainId()
  const chains = useChains()
  const currentChain = chains.find(c => c.id === chainId)
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20">
        ZK
      </div>
      <div>
        <div className="text-lg font-semibold">ZK Vote</div>

        {currentChain && <div className="text-xs text-slate-400">{currentChain.name}</div>}
      </div>
    </div>
  )
}


function ConnectorButton({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector, setReady]);
  const buttonClass = `flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${ready
    ? 'text-slate-100 hover:bg-white/10'
    : 'cursor-not-allowed bg-white/5 text-slate-500 hover:bg-white/0'
    }`;
  return (
    <button
      className={buttonClass}
      disabled={!ready}
      onClick={onClick}
    >
      <span>{connector.name}</span>
    </button>
  );
}

function ConnectorMenu() {
  const chainId = useChainId();
  const { connect, connectors } = useConnect()
  const [mounted, setMounted] = useState(false)
  const [showConnector, setShowConnector] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnector((prev) => (!prev))}
        className="rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30">
        Connect Wallet
      </button>
      {showConnector && <div className="absolute right-0 mt-2 w-35 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-xl shadow-black/30">
        {connectors.map((connector) => (
          <ConnectorButton
            key={connector.uid}
            connector={connector}
            onClick={() => connect({ connector, chainId })}
          />
        ))}
      </div>}
    </div>
  )
}
