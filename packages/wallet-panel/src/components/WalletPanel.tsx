import React, { useMemo } from 'react'
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
  wagmiConfig,
  showChainSelector = true,
  showWalletConnect = true,
  defaultCollapsed = false,
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
}: WalletPanelProps) {
  // Merge provided locale strings with defaults
  const strings: LocaleStrings = useMemo(
    () => ({ ...DEFAULT_LOCALE_STRINGS, ...localeStrings }),
    [localeStrings]
  )

  // Initialize wallet adapter
  const { adapter, isReady, isConnected, isSmartAccountActive } = useWalletAdapter(
    privyClient,
    zerodev
  )

  // Manage wallet state
  const walletState = useWalletState(adapter, tokens)

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
          isLoading={!isReady}
        />
      </div>
    )
  }

  return (
    <div className={cn(
      "wallet-panel bg-card border border-border rounded-lg w-full max-w-sm",
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
          if (adapter) {
            try {
              await adapter.switchChain(chainId)
              await walletState.refreshWalletData()
            } catch (error) {
              console.error('Chain switch failed:', error)
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