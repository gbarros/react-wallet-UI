import { expectType, expectAssignable, expectNotAssignable } from 'tsd'
import type { PrivyClientLike, ZeroDevContextLike } from '../types'

// Type-level contract tests for adapter APIs
// These tests ensure that adapter interfaces remain stable and compatible

describe('PrivyClientLike Contract Tests', () => {
  // Test that PrivyClientLike has required properties
  expectType<{
    user: { wallet: { address: string } } | null
    authenticated: boolean
    ready: boolean
    login: () => Promise<void>
    logout: () => Promise<void>
    getEthereumProvider: () => any
  }>({} as PrivyClientLike)

  // Test that PrivyClientLike is assignable to expected structure
  expectAssignable<PrivyClientLike>({
    user: { wallet: { address: '0x123' } },
    authenticated: true,
    ready: true,
    login: async () => {},
    logout: async () => {},
    getEthereumProvider: () => ({}),
  })

  // Test that incomplete objects are not assignable
  expectNotAssignable<PrivyClientLike>({
    user: { wallet: { address: '0x123' } },
    authenticated: true,
    // missing required properties
  })
})

describe('ZeroDevContextLike Contract Tests', () => {
  // Test that ZeroDevContextLike has required properties
  expectType<{
    projectId: string
    isConnected: boolean
    address: string | undefined
    sendUserOperation: (tx: any) => Promise<{ hash: string; userOpHash: string }>
    switchChain: (chainId: number) => Promise<void>
  }>({} as ZeroDevContextLike)

  // Test that ZeroDevContextLike is assignable to expected structure
  expectAssignable<ZeroDevContextLike>({
    projectId: 'test-project',
    isConnected: true,
    address: '0x456',
    sendUserOperation: async (tx: any) => ({ hash: '0xhash', userOpHash: '0xuserOp' }),
    switchChain: async (chainId: number) => {},
  })

  // Test that incomplete objects are not assignable
  expectNotAssignable<ZeroDevContextLike>({
    projectId: 'test-project',
    isConnected: true,
    // missing required properties
  })
})

describe('Ethereum Provider Contract Tests', () => {
  // Test that Ethereum provider has expected request method
  type EthereumProvider = ReturnType<PrivyClientLike['getEthereumProvider']>
  
  // Provider should have request method that accepts method and params
  expectAssignable<EthereumProvider>({
    request: async ({ method, params }: { method: string; params?: any[] }) => {
      return 'result'
    }
  })
})

describe('UserOperation Contract Tests', () => {
  // Test that sendUserOperation returns expected structure
  type UserOpResult = ReturnType<ZeroDevContextLike['sendUserOperation']>
  
  expectType<Promise<{ hash: string; userOpHash: string }>>(
    {} as UserOpResult
  )
  
  // Test that the result has both required hash fields
  expectAssignable<{ hash: string; userOpHash: string }>({
    hash: '0xtxhash',
    userOpHash: '0xuserophash'
  })
  
  expectNotAssignable<{ hash: string; userOpHash: string }>({
    hash: '0xtxhash'
    // missing userOpHash
  })
})

describe('Chain and Token Contract Tests', () => {
  // Test Chain interface structure
  type Chain = { id: number; name: string }
  
  expectAssignable<Chain>({
    id: 1,
    name: 'Ethereum'
  })
  
  expectNotAssignable<Chain>({
    id: '1', // should be number
    name: 'Ethereum'
  })
  
  // Test Token interface structure  
  type Token = { address: string; symbol: string; decimals: number }
  
  expectAssignable<Token>({
    address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b',
    symbol: 'USDC',
    decimals: 6
  })
  
  expectNotAssignable<Token>({
    address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b',
    symbol: 'USDC'
    // missing decimals
  })
})

describe('WalletPanel Props Contract Tests', () => {
  // Test that WalletPanelProps accepts both client configurations
  import type { WalletPanelProps } from '../types'
  
  // Advanced configuration with pre-built clients
  expectAssignable<WalletPanelProps>({
    privyClient: {
      user: { wallet: { address: '0x123' } },
      authenticated: true,
      ready: true,
      login: async () => {},
      logout: async () => {},
      getEthereumProvider: () => ({})
    },
    zerodev: {
      projectId: 'test',
      isConnected: true,
      address: '0x456',
      sendUserOperation: async () => ({ hash: '0x1', userOpHash: '0x2' }),
      switchChain: async () => {}
    }
  })
  
  // Simple configuration with config object
  expectAssignable<WalletPanelProps>({
    config: {
      privyAppId: 'test-app-id',
      zerodevProjectId: 'test-project-id'
    }
  })
  
  // Should not accept both configurations
  expectNotAssignable<WalletPanelProps>({
    privyClient: {} as PrivyClientLike,
    config: {
      privyAppId: 'test-app-id',
      zerodevProjectId: 'test-project-id'
    }
  })
})

describe('Simple Wallet Config Contract Tests', () => {
  import type { SimpleWalletConfig } from '../types'
  
  // Test required properties
  expectAssignable<SimpleWalletConfig>({
    privyAppId: 'test-app-id',
    zerodevProjectId: 'test-project-id'
  })
  
  // Test with optional properties
  expectAssignable<SimpleWalletConfig>({
    privyAppId: 'test-app-id',
    zerodevProjectId: 'test-project-id',
    walletConnectProjectId: 'wc-project-id',
    defaultChainId: 1,
    customRpcUrls: {
      1: 'https://eth-mainnet.alchemyapi.io/v2/api-key'
    }
  })
  
  // Test that incomplete config is not assignable
  expectNotAssignable<SimpleWalletConfig>({
    privyAppId: 'test-app-id'
    // missing zerodevProjectId
  })
})
