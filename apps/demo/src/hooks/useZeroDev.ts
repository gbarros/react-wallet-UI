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
import { sepolia } from 'viem/chains'

// Environment configuration
const ZERODEV_PROJECT_ID = import.meta.env.VITE_ZERODEV_PROJECT_ID
const ZERODEV_BUNDLER_RPC = import.meta.env.VITE_ZERODEV_BUNDLER_RPC
const ZERODEV_PAYMASTER_RPC = import.meta.env.VITE_ZERODEV_PAYMASTER_RPC

export interface ZeroDevContext {
  projectId: string
  isConnected: boolean
  address?: string
  sendUserOperation: (tx: any) => Promise<{ hash: string; userOpHash: string }>
  switchChain: (chainId: number) => Promise<void>
  kernelClient: ReturnType<typeof createKernelAccountClient> | null
  isLoading: boolean
  error: string | null
  connect: () => Promise<void>
}

export function useZeroDev(): ZeroDevContext {
  const { wallets } = useWallets()
  
  const [kernelClient, setKernelClient] = useState<ReturnType<typeof createKernelAccountClient> | null>(null)
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasBeenDisconnected, setHasBeenDisconnected] = useState(false)

  // Check if environment is properly configured
  const envConfigured = useMemo(() => 
    !!ZERODEV_PROJECT_ID && !!ZERODEV_BUNDLER_RPC && !!ZERODEV_PAYMASTER_RPC,
    []
  )

  const setupSmartAccount = useCallback(async () => {
    if (!envConfigured) {
      setError('ZeroDev environment variables not configured')
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

      // Use sepolia for demo (can be made configurable)
      const chain = sepolia
      const publicClient = createPublicClient({ 
        chain, 
        transport: http(chain.rpcUrls.default.http[0]) 
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
        chain,
        transport: http(ZERODEV_PAYMASTER_RPC),
      })

      // Create Kernel client
      const client = createKernelAccountClient({
        account,
        chain,
        bundlerTransport: http(ZERODEV_BUNDLER_RPC),
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
  }, [wallets, envConfigured])

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

  // Setup smart account when wallets are available (but not if previously disconnected)
  useEffect(() => {
    if (wallets.length > 0 && envConfigured && !hasBeenDisconnected) {
      setupSmartAccount()
    } else if (!envConfigured) {
      setError('ZeroDev environment variables not configured')
    }
  }, [wallets, setupSmartAccount, envConfigured, hasBeenDisconnected])

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
        userOpHash: hash as string, // ZeroDev returns the user operation hash
      }
    } catch (error) {
      console.error('Send user operation error:', error)
      throw error
    }
  }, [kernelClient])

  const switchChain = useCallback(async (chainId: number) => {
    // For now, just log the chain switch request
    // In a full implementation, you'd recreate the client with the new chain
    console.log('Switch chain requested:', chainId)
  }, [])

  // Add a manual connect function to allow reconnection after disconnect
  const connect = useCallback(async () => {
    setHasBeenDisconnected(false)
    if (wallets.length > 0 && envConfigured) {
      await setupSmartAccount()
    }
  }, [wallets, envConfigured, setupSmartAccount])

  return {
    projectId: ZERODEV_PROJECT_ID || '',
    isConnected: !!kernelClient && !!address,
    address,
    sendUserOperation,
    switchChain,
    kernelClient,
    isLoading,
    error,
    connect, // Add connect method for manual reconnection
  }
}
