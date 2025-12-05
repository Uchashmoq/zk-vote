import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export function getConfig() {
  return createConfig({
    autoConnect: false,
    chains: [mainnet, sepolia],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
    connectors: [
      injected({ target: 'metaMask', shimDisconnect: true }),
      injected({ target: 'phantom', shimDisconnect: true }),
      injected({ target: 'okxwallet', shimDisconnect: true }),
      injected({ shimDisconnect: true }),
    ],
  })
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>
  }
}
