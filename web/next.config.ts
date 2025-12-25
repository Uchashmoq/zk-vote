import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "*.mypinata.cloud",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
  webpack(config) {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),

      // wagmi optional connector deps (we don't use them)
      "@coinbase/wallet-sdk": false,
      "@metamask/sdk": false,
      "@gemini-wallet/core": false,
      "@base-org/account": false,

      // Safe
      "@safe-global/safe-apps-sdk": false,
      "@safe-global/safe-apps-provider": false,

      // WalletConnect
      "@walletconnect/ethereum-provider": false,

      // Porto
      porto: false,
      "porto/internal": false,
    };
    return config;
  },
};

export default nextConfig;
