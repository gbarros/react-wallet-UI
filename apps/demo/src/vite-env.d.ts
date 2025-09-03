/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_ZERODEV_PROJECT_ID: string
  readonly VITE_ZERODEV_BUNDLER_RPC: string
  readonly VITE_ZERODEV_PAYMASTER_RPC: string
  readonly VITE_ETHEREUM_RPC_URL: string
  readonly VITE_POLYGON_RPC_URL: string
  readonly VITE_BASE_RPC_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
