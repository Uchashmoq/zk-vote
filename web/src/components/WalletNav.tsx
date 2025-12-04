import { useMemo, useState } from 'react'
import {
  useAccount,
  useChainId,
  useConnect,
  useConnectors,
  useDisconnect,
  useSwitchChain,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'

function shorten(addr?: string) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function WalletNav() {
  const { address, status: accountStatus, chain } = useAccount()
  const activeChainId = useChainId()
  const { disconnect } = useDisconnect()
  const connectors = useConnectors()
  const { connect, status: connectStatus } = useConnect()
  const { switchChainAsync, isPending: switchPending } = useSwitchChain()
  const [menuOpen, setMenuOpen] = useState(false)
  const isBrowser = typeof window !== 'undefined'

  const orderedConnectors = useMemo(() => {
    const priority = ['metamask', 'phantom', 'okx', 'browser']
    return [...connectors].sort((a, b) => {
      const ia = priority.indexOf(a.name.toLowerCase())
      const ib = priority.indexOf(b.name.toLowerCase())
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Brand />
        <div className="relative flex items-center gap-3">
          {isConnected && (
            <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-200">
              {isOnSepolia ? 'Sepolia' : chain?.name || 'Wrong network'} · {shorten(address)}
            </div>
          )}
          {!isConnected ? (
            <ConnectorMenu
              orderedConnectors={orderedConnectors}
              connectStatus={connectStatus}
              isBrowser={isBrowser}
              onConnect={handleConnect}
              open={menuOpen}
              onToggle={() => setMenuOpen((v) => !v)}
            />
          ) : (
            <>
              {!isOnSepolia && (
                <button
                  onClick={handleSwitch}
                  disabled={switchPending}
                  className="rounded-xl border border-amber-300/60 px-3 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {switchPending ? 'Switching…' : 'Switch to Sepolia'}
                </button>
              )}
              <button
                onClick={() => disconnect()}
                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/20"
              >
                Disconnect
              </button>
            </>
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
            const available = connector.ready ?? props.isBrowser
            return (
              <button
                key={connector.uid}
                disabled={!available}
                onClick={() => props.onConnect(connector.uid)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{connector.name}</span>
                {!available && <span className="text-amber-300">Unavailable</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
