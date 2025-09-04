import { useMemo } from 'react'
import type { WalletPanelProps, LocaleStrings } from '../types'
import { DEFAULT_LOCALE_STRINGS } from '../types'
import { useWalletAdapter } from '../hooks/useWalletAdapter'
import { useWalletState } from '../hooks/useWalletState'
import { cn } from '../lib/utils'
import { WalletHeader } from './WalletHeader'
import { WalletTabs } from './WalletTabs'
import { ConnectPrompt } from './ConnectPrompt'

/**
 * Main wallet panel component
 * Provides a complete wallet interface with balance, send, receive, and sign functionality
 */
export function WalletPanel({
  privyClient,
  zerodev,
  showChainSelector = true,
  showWalletConnect = true,
  chains = [],
  tokens = [],
  enableSponsoredTx = false,
  onRequestLogin,
  onTxSubmitted,
  onTxConfirmed,
  onSign,
  onRequestExport,
  localeStrings = {},
  className,
  adapter,
}: WalletPanelProps) {
  // Merge provided locale strings with defaults
  const strings: LocaleStrings = useMemo(
    () => ({ ...DEFAULT_LOCALE_STRINGS, ...localeStrings }),
    [localeStrings]
  )

  // Always call useWalletAdapter hook (Rules of Hooks)
  const walletAdapterResult = useWalletAdapter(privyClient, zerodev)
  
  // Use injected adapter if provided (for integration/testing), otherwise use hook result
  const adapterResult = useMemo(() => {
    if (adapter) {
      // Simulate the return shape of useWalletAdapter
      return {
        adapter,
        isReady: adapter.isReady?.() ?? false,
        isConnected: adapter.isConnected?.() ?? false,
        isSmartAccountActive: adapter.isSmartAccountActive?.() ?? false,
      }
    }
    return walletAdapterResult
  }, [adapter, walletAdapterResult])

  const { adapter: activeAdapter, isConnected, isSmartAccountActive } = adapterResult
  // Manage wallet state
  const walletState = useWalletState(activeAdapter, tokens)

  // Handle login request
  const handleLogin = async () => {
    if (onRequestLogin) {
      onRequestLogin()
    } else if (adapter) {
      try {
        await adapter.login()
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className={cn(
        "wallet-panel bg-card border border-border rounded-lg p-4 w-full max-w-sm",
        className
      )}>
        <ConnectPrompt
          onConnect={handleLogin}
          strings={strings}
          isLoading={false}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "wallet-panel bg-card border border-border rounded-lg w-full max-w-sm min-w-0",
      className
    )}>
      <WalletHeader
        address={walletState.address}
        chainId={walletState.chainId}
        isSmartAccount={walletState.isSmartAccount}
        showChainSelector={showChainSelector}
        chains={chains}
        strings={strings}
        onChainChange={async (chainId) => {
          if (activeAdapter) {
            try {
              await activeAdapter.switchChain(chainId)
              await walletState.refreshWalletData()
            } catch (error) {
              console.error('Chain switch failed:', error)
            }
          }
        }}
        onDisconnect={async () => {
          if (activeAdapter) {
            try {
              await activeAdapter.logout()
            } catch (error) {
              console.error('Logout failed:', error)
            }
          }
        }}
      />
      
      <WalletTabs
        adapter={adapter}
        walletState={walletState}
        tokens={tokens}
        enableSponsoredTx={enableSponsoredTx && isSmartAccountActive}
        showWalletConnect={showWalletConnect}
        strings={strings}
        onTxSubmitted={onTxSubmitted}
        onTxConfirmed={onTxConfirmed}
        onSign={onSign}
        onRequestExport={onRequestExport}
      />
    </div>
  )
}