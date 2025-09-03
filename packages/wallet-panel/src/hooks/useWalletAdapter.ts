import { useMemo } from 'react'
import type { PrivyClientLike, ZeroDevContextLike } from '../types'
import { UnifiedWalletAdapter } from '../adapters'

/**
 * Hook to create and manage the unified wallet adapter
 */
export function useWalletAdapter(
  privyClient?: PrivyClientLike,
  zerodevContext?: ZeroDevContextLike
) {
  const adapter = useMemo(() => {
    if (!privyClient && !zerodevContext) {
      return null
    }
    
    try {
      return new UnifiedWalletAdapter(privyClient, zerodevContext)
    } catch (error) {
      console.error('Failed to create wallet adapter:', error)
      return null
    }
  }, [privyClient, zerodevContext])

  const isReady = adapter?.isReady() ?? false
  const isConnected = adapter?.isConnected() ?? false
  const isSmartAccountActive = adapter?.isSmartAccountActive() ?? false

  return {
    adapter,
    isReady,
    isConnected,
    isSmartAccountActive,
  }
}