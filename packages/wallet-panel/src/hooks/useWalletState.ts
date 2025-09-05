
import { useState, useEffect, useCallback } from 'react'
import type { WalletState, TokenBalance, Erc20 } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { createPublicClient, http, formatUnits } from 'viem'

// Default to public RPC if no RPC provided
const getPublicClient = (chainId: number, rpcUrl?: string) => {
  const url = rpcUrl || 'https://eth.llamarpc.com'
  return createPublicClient({
    chain: { id: chainId, name: 'Custom', network: 'custom', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [url] } } },
    transport: http(url),
  })
}

/**
 * Hook to manage wallet state including balances and connection status
 */
export function useWalletState(
  adapter: UnifiedWalletAdapter | null,
  tokens: Erc20[] = []
): WalletState {
  
  const refreshWalletData = useCallback(async () => {
    if (!adapter || !adapter.isConnected()) {
      setState(prev => ({ ...prev, isConnected: false, isLoading: false }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const address = await adapter.getAddress()
      const chainId = await adapter.getChainId()
      const walletInfo = await adapter.getWalletInfo()

      // Fetch native balance
      const client = getPublicClient(chainId)
      const nativeBalance = await client.getBalance({ address })

      // Fetch token balances
      const tokenBalances: TokenBalance[] = []
      for (const token of tokens) {
        try {
          const balance = await client.readContract({
            address: token.address,
            abi: [
              {
                name: 'balanceOf',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ name: 'account', type: 'address' }],
                outputs: [{ name: '', type: 'uint256' }],
              },
            ],
            functionName: 'balanceOf',
            args: [address],
          }) as bigint

          tokenBalances.push({
            token,
            balance,
            formatted: formatUnits(balance, token.decimals),
          })
        } catch (error) {
          console.warn(`Failed to fetch balance for ${token.symbol}:`, error)
        }
      }

      setState(prev => ({
        ...prev,
        isConnected: true,
        address,
        chainId,
        isSmartAccount: walletInfo.isSmartAccount,
        nativeBalance: {
          balance: nativeBalance,
          formatted: formatUnits(nativeBalance, 18),
          symbol: 'ETH',
        },
        tokenBalances,
        isLoading: false,
      }))
    } catch (error) {
      console.error('Failed to refresh wallet data:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [adapter, tokens])

  const [state, setState] = useState<WalletState>(() => ({
    isConnected: false,
    isSmartAccount: false,
    tokenBalances: [],
    isLoading: false,
    refreshWalletData,
  }))

  // Update refreshWalletData in state when it changes
  useEffect(() => {
    setState(prev => ({ ...prev, refreshWalletData }))
  }, [refreshWalletData])

  // Refresh data when adapter or tokens change
  useEffect(() => {
    if (adapter) {
      refreshWalletData()
    } else {
      setState(prev => ({ ...prev, isConnected: false, isLoading: false }))
    }
  }, [adapter, refreshWalletData])

  // Set up periodic refresh
  useEffect(() => {
    if (!adapter?.isConnected()) return

    // Avoid background intervals during tests to prevent hanging processes
    if (typeof process !== 'undefined' && process.env && process.env['NODE_ENV'] === 'test') {
      return
    }

    const interval = setInterval(refreshWalletData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [adapter, refreshWalletData])

  return state
}