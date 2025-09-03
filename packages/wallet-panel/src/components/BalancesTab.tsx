// import React from 'react' // Not needed with new JSX transform
import { RefreshCw } from 'lucide-react'
import type { WalletState, LocaleStrings } from '../types'
import { Button } from './ui/button'
// import { formatBalance } from '../lib/utils' // Currently unused

interface BalancesTabProps {
  walletState: WalletState
  strings: LocaleStrings
  onRefresh: () => void
}

/**
 * Component to display native and token balances
 */
export function BalancesTab({ walletState, strings, onRefresh }: BalancesTabProps) {
  const { nativeBalance, tokenBalances, isLoading } = walletState

  return (
    <div className="p-4 space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{strings.balances}</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8 w-8"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Native balance */}
      {nativeBalance && (
        <div className="p-3 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {nativeBalance.symbol.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium">{nativeBalance.symbol}</div>
                <div className="text-sm text-muted-foreground">Native Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{nativeBalance.formatted}</div>
              <div className="text-sm text-muted-foreground">{nativeBalance.symbol}</div>
            </div>
          </div>
        </div>
      )}

      {/* Token balances */}
      <div className="space-y-2">
        {tokenBalances.length > 0 ? (
          tokenBalances.map((tokenBalance) => (
            <div
              key={tokenBalance.token.address}
              className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {tokenBalance.token.logoUrl ? (
                    <img
                      src={tokenBalance.token.logoUrl}
                      alt={tokenBalance.token.symbol}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-bold">
                        {tokenBalance.token.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{tokenBalance.token.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {tokenBalance.token.address.slice(0, 6)}...{tokenBalance.token.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{tokenBalance.formatted}</div>
                  <div className="text-sm text-muted-foreground">{tokenBalance.token.symbol}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-sm">{strings.noTokens}</div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading balances...</span>
        </div>
      )}
    </div>
  )
}