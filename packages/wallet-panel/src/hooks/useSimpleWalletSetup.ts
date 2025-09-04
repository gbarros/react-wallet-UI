import { useCallback, useEffect, useMemo, useState } from 'react'
import { useWallets } from '@privy-io/react-auth'
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { constants } from '@zerodev/sdk'
import { http, createPublicClient, EIP1193Provider } from 'viem'
import { sepolia, mainnet, polygon, base, type Chain } from 'viem/chains'
import type { SimpleWalletConfig, ZeroDevContextLike } from '../types'

// Chain mapping
const CHAIN_MAP: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [mainnet.id]: mainnet,
  [polygon.id]: polygon,
  [base.id]: base,
}

// Default RPC URLs for common chains
const DEFAULT_RPC_URLS: Record<number, string> = {
  [sepolia.id]: 'https://eth-sepolia.g.alchemy.com/v2/demo',
  [mainnet.id]: 'https://eth.llamarpc.com',
  [polygon.id]: 'https://polygon.llamarpc.com',
  [base.id]: 'https://base.llamarpc.com',
}

interface SimpleZeroDevContext extends ZeroDevContextLike {
  kernelClient: ReturnType<typeof createKernelAccountClient> | null
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
}

/**
 * Hook to create ZeroDev context from simple configuration
 */
function useSimpleZeroDev(config: SimpleWalletConfig): SimpleZeroDevContext {
  const { wallets } = useWallets()
  
  const [kernelClient, setKernelClient] = useState<ReturnType<typeof createKernelAccountClient> | null>(null)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasBeenDisconnected, setHasBeenDisconnected] = useState(false)

  // Build configuration from simple config
  const zeroDevConfig = useMemo(() => {
    if (!config.zerodevProjectId) return null
    
    const chainId = config.defaultChainId || sepolia.id
    const rpcUrl = config.customRpcUrls?.[chainId] || DEFAULT_RPC_URLS[chainId]
    
    return {
      projectId: config.zerodevProjectId,
      bundlerRpc: `https://rpc.zerodev.app/api/v2/bundler/${config.zerodevProjectId}`,
      paymasterRpc: `https://rpc.zerodev.app/api/v2/paymaster/${config.zerodevProjectId}`,
      chainId,
      rpcUrl,
      chain: CHAIN_MAP[chainId] || sepolia,
    }
  }, [config.zerodevProjectId, config.defaultChainId, config.customRpcUrls])

  const setupSmartAccount = useCallback(async () => {
    if (!zeroDevConfig) {
      setError('ZeroDev configuration not provided')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Find embedded wallet from Privy
      const embedded = wallets.find((w) => w.walletClientType === 'privy')
      if (!embedded) {
        throw new Error('Embedded wallet not found. Ensure embedded wallets are enabled in Privy config.')
      }

      const provider = await embedded.getEthereumProvider()
      const signer = provider as EIP1193Provider

      const publicClient = createPublicClient({ 
        chain: zeroDevConfig.chain, 
        transport: http(zeroDevConfig.rpcUrl) 
      })

      // Configure EntryPoint and Kernel version
      const entryPoint = constants.getEntryPoint('0.7')
      const kernelVersion = constants.KERNEL_V3_3

      // Create ZeroDev validator & account
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        entryPoint,
        kernelVersion,
      })

      const account = await createKernelAccount(publicClient, {
        plugins: { sudo: ecdsaValidator },
        entryPoint,
        kernelVersion,
      })

      // Configure ZeroDev Paymaster client
      const paymaster = createZeroDevPaymasterClient({
        chain: zeroDevConfig.chain,
        transport: http(zeroDevConfig.paymasterRpc),
      })

      // Create Kernel client
      const client = createKernelAccountClient({
        account,
        chain: zeroDevConfig.chain,
        bundlerTransport: http(zeroDevConfig.bundlerRpc),
        paymaster,
      })

      setKernelClient(client)
      setAddress(client.account?.address)
    } catch (e: unknown) {
      console.error('ZeroDev setup error:', e)
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg || 'Failed to initialize smart account')
    } finally {
      setIsLoading(false)
    }
  }, [wallets, zeroDevConfig])

  // Reset state when wallets are disconnected
  useEffect(() => {
    if (wallets.length === 0) {
      setKernelClient(null)
      setAddress(undefined)
      setIsLoading(false)
      setError(null)
      setHasBeenDisconnected(true)
    }
  }, [wallets.length])

  // Setup smart account when wallets are available
  useEffect(() => {
    if (wallets.length > 0 && zeroDevConfig && !hasBeenDisconnected) {
      setupSmartAccount()
    } else if (!zeroDevConfig) {
      setError('ZeroDev configuration not provided')
    }
  }, [wallets, setupSmartAccount, zeroDevConfig, hasBeenDisconnected])

  const sendUserOperation = useCallback(async (tx: any) => {
    if (!kernelClient) {
      throw new Error('Smart account not initialized')
    }

    try {
      const hash = await kernelClient.sendUserOperation({
        ...tx,
        account: kernelClient.account!,
      })

      return {
        hash: hash as string,
        userOpHash: hash as string,
      }
    } catch (error) {
      console.error('Send user operation error:', error)
      throw error
    }
  }, [kernelClient])

  const switchChain = useCallback(async (chainId: number) => {
    console.log('Switch chain requested:', chainId)
    // In a full implementation, you'd recreate the client with the new chain
  }, [])

  const connect = useCallback(async () => {
    setHasBeenDisconnected(false)
    if (wallets.length > 0 && zeroDevConfig) {
      await setupSmartAccount()
    }
  }, [wallets, zeroDevConfig, setupSmartAccount])

  return {
    projectId: zeroDevConfig?.projectId || '',
    isConnected: !!kernelClient && !!address,
    address,
    sendUserOperation,
    switchChain,
    kernelClient,
    isLoading,
    error,
    connect,
  }
}

/**
 * Hook to set up wallet clients from simple configuration
 */
export function useSimpleWalletSetup(config?: SimpleWalletConfig) {
  // Create ZeroDev context if configuration is provided
  const zeroDevContext = useSimpleZeroDev(config || {})
  
  // For Privy, we can't create the client here since it needs to be at the provider level
  // Instead, we return configuration that can be used by the parent component
  const privyConfig = useMemo(() => {
    if (!config?.privyAppId) return null
    
    return {
      appId: config.privyAppId,
      config: {
        embeddedWallets: {
          createOnLogin: 'users-without-wallets' as const,
          requireUserPasswordOnCreate: false,
        },
        supportedChains: [sepolia, mainnet, polygon, base],
        appearance: {
          theme: 'light' as const,
          accentColor: '#676FFF',
        },
        ...(config.walletConnectProjectId && {
          externalWallets: {
            walletConnect: {
              projectId: config.walletConnectProjectId,
            },
          },
        }),
      },
    }
  }, [config?.privyAppId, config?.walletConnectProjectId])

  return {
    zeroDevContext: config?.zerodevProjectId ? zeroDevContext : null,
    privyConfig,
    isConfigured: !!(config?.privyAppId || config?.zerodevProjectId),
  }
}
