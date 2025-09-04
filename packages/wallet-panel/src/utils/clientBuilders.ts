import { sepolia, mainnet, polygon, base } from 'viem/chains'
import type { SimpleWalletConfig, PrivyClientLike, ZeroDevContextLike } from '../types'

// Default RPC URLs for common chains
const DEFAULT_RPC_URLS: Record<number, string> = {
  [sepolia.id]: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  [mainnet.id]: 'https://eth.llamarpc.com',
  [polygon.id]: 'https://polygon.llamarpc.com',
  [base.id]: 'https://base.llamarpc.com',
}

// Default chain configuration
const DEFAULT_CHAIN_ID = sepolia.id

/**
 * Build Privy client configuration from simple config
 */
export function buildPrivyConfig(config: SimpleWalletConfig) {
  if (!config.privyAppId) {
    throw new Error('privyAppId is required for simple wallet configuration')
  }

  return {
    appId: config.privyAppId,
    config: {
      // Enable embedded wallets by default for simple setup
      embeddedWallets: {
        createOnLogin: 'users-without-wallets' as const,
        requireUserPasswordOnCreate: false,
      },
      // Configure supported chains
      supportedChains: [sepolia, mainnet, polygon, base],
      // Default appearance
      appearance: {
        theme: 'light' as const,
        accentColor: '#676FFF',
      },
      // WalletConnect integration if provided
      ...(config.walletConnectProjectId && {
        externalWallets: {
          walletConnect: {
            projectId: config.walletConnectProjectId,
          },
        },
      }),
    },
  }
}

/**
 * Create a simple Privy client wrapper that matches PrivyClientLike interface
 * Note: This is a placeholder - actual Privy integration requires PrivyProvider at app level
 */
export function createSimplePrivyClient(config: SimpleWalletConfig): PrivyClientLike {
  buildPrivyConfig(config) // Validate config
  
  // This is a simplified client that would need to be properly integrated
  // with the actual Privy provider in the component tree
  return {
    user: undefined,
    authenticated: false,
    ready: false,
    async login() {
      throw new Error('Simple Privy client needs to be integrated with PrivyProvider')
    },
    async logout() {
      throw new Error('Simple Privy client needs to be integrated with PrivyProvider')
    },
    getEthereumProvider() {
      throw new Error('Simple Privy client needs to be integrated with PrivyProvider')
    },
  }
}

/**
 * Build ZeroDev configuration from simple config
 */
export function buildZeroDevConfig(config: SimpleWalletConfig) {
  if (!config.zerodevProjectId) {
    throw new Error('zerodevProjectId is required for simple wallet configuration')
  }

  const chainId = config.defaultChainId || DEFAULT_CHAIN_ID
  const rpcUrl = config.customRpcUrls?.[chainId] || DEFAULT_RPC_URLS[chainId]

  return {
    projectId: config.zerodevProjectId,
    bundlerRpc: `https://rpc.zerodev.app/api/v2/bundler/${config.zerodevProjectId}`,
    paymasterRpc: `https://rpc.zerodev.app/api/v2/paymaster/${config.zerodevProjectId}`,
    chainId,
    rpcUrl,
  }
}

/**
 * Create a simple ZeroDev context wrapper that matches ZeroDevContextLike interface
 */
export function createSimpleZeroDevContext(config: SimpleWalletConfig): ZeroDevContextLike {
  const zeroDevConfig = buildZeroDevConfig(config)
  
  // This is a simplified context that would need to be properly integrated
  // with the actual ZeroDev setup logic
  return {
    projectId: zeroDevConfig.projectId,
    isConnected: false,
    address: undefined,
    async sendUserOperation(_tx: any) {
      throw new Error('Simple ZeroDev context needs to be properly initialized')
    },
    async switchChain(_chainId: number) {
      throw new Error('Simple ZeroDev context needs to be properly initialized')
    },
  }
}

/**
 * Validate that the simple configuration has required fields
 */
export function validateSimpleConfig(config: SimpleWalletConfig): void {
  if (!config.privyAppId && !config.zerodevProjectId) {
    throw new Error('Either privyAppId or zerodevProjectId must be provided in simple configuration')
  }
}
