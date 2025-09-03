
import { useState, useEffect, useCallback } from 'react'
import type { Address } from '../types'
import type { WalletState, TokenBalance, NativeBalance, Erc20 } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { formatBalance } from '../lib/utils'
import { createPublicClient, http, formatUnits } from 'viem'

// Default to Ethereum mainnet if no RPC provided
const getPublicClient = (chainId: number, rpcUrl?: string) => {
  // You may want to extend this to support more chains and custom RPCs
  const url = rpcUrl || 'https://mainnet.infura.io/v3/your-infura-id'
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
    chainId: number,
    rpcUrl?: string,
  ): Promise<NativeBalance | undefined> => {
    try {
      const client = getPublicClient(chainId, rpcUrl)
      const balance = await client.getBalance({ address })
      // TODO: Optionally fetch symbol from chain config
      return {
        balance,
        formatted: formatUnits(balance, 18),
        symbol: 'ETH',
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
    tokens: Erc20[],
    chainId?: number,
    rpcUrl?: string,
  ): Promise<TokenBalance[]> => {
    try {
      if (!tokens.length) return []
      const client = getPublicClient(chainId || 1, rpcUrl)
      // ERC-20 ABI fragment for balanceOf
      const erc20Abi = [
        { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
      ]
      const balances = await Promise.all(tokens.map(async (token) => {
        try {
          const [balance] = await client.readContract({
            address: token.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
          })
          return {
            token,
            balance: BigInt(balance),
            formatted: formatUnits(BigInt(balance), token.decimals),
          }
        } catch (error) {
          console.error(`Failed to fetch balance for token ${token.symbol}:`, error)
          return {
            token,
            balance: 0n,
            formatted: '0',
          }
        }
      }))
      return balances
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
        fetchTokenBalances(address, tokens, chainId),
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