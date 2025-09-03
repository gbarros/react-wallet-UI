import { useState, useEffect, useCallback } from 'react'
import type { Address } from 'viem'
import type { WalletState, TokenBalance, NativeBalance, Erc20 } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { formatBalance } from '../lib/utils'

/**
 * Hook to manage wallet state including balances and connection status
 */
export function useWalletState(
  adapter: UnifiedWalletAdapter | null,
  tokens: Erc20[] = []
) {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    isSmartAccount: false,
    tokenBalances: [],
    isLoading: false,
  })

  /**
   * Fetch native balance for the current address
   */
  const fetchNativeBalance = useCallback(async (
    address: Address,
    chainId: number
  ): Promise<NativeBalance | undefined> => {
    try {
      // This would typically use wagmi/viem to fetch balance
      // For now, we'll return a placeholder
      return {
        balance: 0n,
        formatted: '0',
        symbol: 'ETH', // This should be determined by chain
      }
    } catch (error) {
      console.error('Failed to fetch native balance:', error)
      return undefined
    }
  }, [])

  /**
   * Fetch ERC-20 token balances
   */
  const fetchTokenBalances = useCallback(async (
    address: Address,
    tokens: Erc20[]
  ): Promise<TokenBalance[]> => {
    try {
      // This would typically use wagmi/viem to fetch token balances
      // For now, we'll return placeholders
      return tokens.map(token => ({
        token,
        balance: 0n,
        formatted: formatBalance(0n, token.decimals),
      }))
    } catch (error) {
      console.error('Failed to fetch token balances:', error)
      return []
    }
  }, [])

  /**
   * Refresh all wallet data
   */
  const refreshWalletData = useCallback(async () => {
    if (!adapter || !adapter.isConnected()) {
      setState(prev => ({
        ...prev,
        isConnected: false,
        address: undefined,
        chainId: undefined,
        nativeBalance: undefined,
        tokenBalances: [],
        isLoading: false,
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: undefined }))

    try {
      const [address, chainId, walletInfo] = await Promise.all([
        adapter.getAddress(),
        adapter.getChainId(),
        adapter.getWalletInfo(),
      ])

      const [nativeBalance, tokenBalances] = await Promise.all([
        fetchNativeBalance(address, chainId),
        fetchTokenBalances(address, tokens),
      ])

      setState({
        isConnected: true,
        address,
        chainId,
        isSmartAccount: walletInfo.isSmartAccount,
        nativeBalance,
        tokenBalances,
        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to refresh wallet data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }))
    }
  }, [adapter, tokens, fetchNativeBalance, fetchTokenBalances])

  /**
   * Effect to refresh data when adapter or tokens change
   */
  useEffect(() => {
    refreshWalletData()
  }, [refreshWalletData])

  /**
   * Effect to set up periodic refresh
   */
  useEffect(() => {
    if (!adapter?.isConnected()) return

    const interval = setInterval(refreshWalletData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [adapter, refreshWalletData])

  return {
    ...state,
    refreshWalletData,
  }
}