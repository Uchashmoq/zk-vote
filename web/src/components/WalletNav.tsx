'use client'
import { useMemo, useState } from 'react'
import { MoreHorizontal, Search } from 'lucide-react'
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'

function normalizeName(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('metamask')) return 'metamask'
  if (lower.includes('phantom')) return 'phantom'
  if (lower.includes('okx')) return 'okx'
  if (lower.includes('injected')) return 'injected'
  return lower
}

function prettyName(name: string) {
  switch (name) {
    case 'metamask':
      return 'MetaMask'
    case 'phantom':
      return 'Phantom'
    case 'okx':
      return 'OKX Wallet'
    case 'injected':
      return 'Injected'
    default:
      return name
  }
}

function shorten(addr?: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function SearchBar(props: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative flex w-full min-w-[180px] max-w-lg items-center">
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder="搜索投票关键词"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30"
      />
      <Search className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" strokeWidth={2} />
    </div>
  )
}

function RightActions(props: {
  isConnected: boolean
  isOnSepolia: boolean
  chainName?: string
  address?: string
  switchPending: boolean
  onSwitch: () => void
  onDisconnect: () => void
  connectStatus: ReturnType<typeof useConnect>['status']
  orderedConnectors: ReturnType<typeof useConnectors>
  isBrowser: boolean
  menuOpen: boolean
  onToggleMenu: () => void
  onConnect: (uid: string) => void
}) {
  return (
    <div className="relative flex items-center gap-3">
      {props.isConnected && (
        <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200">
          {props.isOnSepolia ? 'Sepolia' : props.chainName || 'Wrong network'} ·{' '}
          {shorten(props.address)}
        </div>
      )}
      {!props.isConnected ? (
        <ConnectorMenu
          orderedConnectors={props.orderedConnectors}
          connectStatus={props.connectStatus}
          isBrowser={props.isBrowser}
          onConnect={props.onConnect}
          open={props.menuOpen}
          onToggle={props.onToggleMenu}
        />
      ) : (
        <>
          {!props.isOnSepolia && (
            <button
              onClick={props.onSwitch}
              disabled={props.switchPending}
              className="rounded-xl border border-amber-300/60 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {props.switchPending ? 'Switching…' : 'Switch to Sepolia'}
            </button>
          )}
          <button
            onClick={props.onDisconnect}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  )
}

export default function WalletNav() {
  const { address, status: accountStatus, chain } = useAccount()
  const activeChainId = useChainId()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()
  const { connect, status: connectStatus } = useConnect()
  const { switchChainAsync, isPending: switchPending } = useSwitchChain()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const isBrowser = typeof window !== 'undefined'

  const orderedConnectors = useMemo(() => {
    const seen = new Set<string>()
    const deduped = connectors.filter((c) => {
      const key = normalizeName(c.name)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    const priority = ['metamask', 'phantom', 'okx', 'injected']
    return deduped.sort((a, b) => {
      const ia = priority.indexOf(normalizeName(a.name))
      const ib = priority.indexOf(normalizeName(b.name))
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
  }, [connectors])

  const isConnected = accountStatus === 'connected'
  const isOnSepolia = chain?.id === sepolia.id || activeChainId === sepolia.id

  async function handleConnect(connectorUid: string) {
    const connector = orderedConnectors.find((c) => c.uid === connectorUid)
    if (!connector) return
    setMenuOpen(false)
    connect({ connector, chainId: sepolia.id })
  }

  async function handleSwitch() {
    await switchChainAsync({ chainId: sepolia.id })
  }

  return (
    <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
        <div className="hidden sm:block">
          <Brand />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <RightActions
            isConnected={isConnected}
            isOnSepolia={isOnSepolia}
            chainName={chain?.name}
            address={address}
            switchPending={switchPending}
            onSwitch={handleSwitch}
            onDisconnect={disconnect}
            connectStatus={connectStatus}
            orderedConnectors={orderedConnectors}
            isBrowser={isBrowser}
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((v) => !v)}
            onConnect={handleConnect}
          />
        </div>
        <div className="ml-auto sm:hidden">
          <button
            onClick={() => setMobileActionsOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
            aria-expanded={mobileActionsOpen}
            aria-label="Open actions menu"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {mobileActionsOpen && (
            <div className="absolute right-6 mt-2 w-64 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-xl shadow-black/30">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200">
                <span>{isOnSepolia ? 'Sepolia' : chain?.name || 'Wrong network'}</span>
                {isConnected && <span className="font-mono">{shorten(address)}</span>}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {!isConnected ? (
                  <ConnectorMenu
                    orderedConnectors={orderedConnectors}
                    connectStatus={connectStatus}
                    isBrowser={isBrowser}
                    onConnect={(uid) => {
                      handleConnect(uid)
                      setMobileActionsOpen(false)
                    }}
                    open={menuOpen}
                    onToggle={() => setMenuOpen((v) => !v)}
                  />
                ) : (
                  <>
                    {!isOnSepolia && (
                      <button
                        onClick={handleSwitch}
                        disabled={switchPending}
                        className="w-full rounded-xl border border-amber-300/60 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {switchPending ? 'Switching…' : 'Switch to Sepolia'}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        disconnect()
                        setMobileActionsOpen(false)
                      }}
                      className="w-full rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20">
        ZK
      </div>
      <div>
        <div className="text-lg font-semibold">ZK Vote</div>
        <div className="text-xs text-slate-400">Sepolia testnet</div>
      </div>
    </div>
  )
}

function ConnectorMenu(props: {
  orderedConnectors: ReturnType<typeof useConnectors>
  connectStatus: ReturnType<typeof useConnect>['status']
  isBrowser: boolean
  onConnect: (uid: string) => void
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <button
        onClick={props.onToggle}
        className="rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
      >
        {props.connectStatus === 'pending' ? 'Connecting…' : 'Connect Wallet'}
      </button>
      {props.open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-xl shadow-black/30">
          {props.orderedConnectors.map((connector) => {
            const available = (connector.ready ?? true) && props.isBrowser
            return (
              <button
                key={connector.uid}
                disabled={!available}
                onClick={() => props.onConnect(connector.uid)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{prettyName(normalizeName(connector.name))}</span>
                {!available && <span className="text-amber-300">Unavailable</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
