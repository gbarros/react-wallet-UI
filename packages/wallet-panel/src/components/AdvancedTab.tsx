import { useState, useEffect } from 'react'
import { ExternalLink, ChevronDown, ChevronRight } from 'lucide-react'
import type { Address } from '../types'
import type { LocaleStrings } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { Button } from './ui/button'
import { Switch } from './ui/switch'
import { truncateAddress } from '../lib/utils'

interface AdvancedTabProps {
  adapter: UnifiedWalletAdapter | null
  address?: Address
  isSmartAccount: boolean
  strings: LocaleStrings
  onRequestExport?: () => void
}

/**
 * Advanced tab with wallet details and settings
 */
export function AdvancedTab({
  adapter,
  address,
  isSmartAccount,
  strings,
  onRequestExport,
}: AdvancedTabProps) {
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [preferSmartAccount, setPreferSmartAccount] = useState(true)

  // Load wallet information
  useEffect(() => {
    if (!adapter) return

    const loadWalletInfo = async () => {
      try {
        const info = await adapter.getWalletInfo()
        setWalletInfo(info)
        setPreferSmartAccount(info.isSmartAccount)
      } catch (error) {
        console.error('Failed to load wallet info:', error)
      }
    }

    loadWalletInfo()
  }, [adapter])

  const handleToggleAccountType = async (useSmartAccount: boolean) => {
    if (!adapter) return
    
    const info = await adapter.getWalletInfo()
    if (info.mode === 'privy-only') return
    
    try {
      adapter.setPreferSmartAccount(useSmartAccount)
      setPreferSmartAccount(useSmartAccount)
    } catch (error) {
      console.error('Failed to toggle account type:', error)
    }
  }

  if (!adapter || !address) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">No wallet information available</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{strings.advanced}</h3>
      </div>

      {/* Account type */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{strings.accountType}</div>
            <div className="text-sm text-muted-foreground">
              {isSmartAccount ? strings.smartAccount : strings.eoaAccount}
            </div>
          </div>
          <div className="px-2 py-1 bg-muted rounded text-xs font-medium">
            {walletInfo?.mode || 'Unknown'}
          </div>
        </div>

        {/* Smart account toggle (if both are available) */}
        {walletInfo?.hasPrivy && walletInfo?.hasZeroDev && (
          <div className="p-3 border border-border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Use Smart Account</div>
                <div className="text-xs text-muted-foreground">
                  Switch between smart account and EOA
                </div>
              </div>
              <Switch
                checked={preferSmartAccount}
                onCheckedChange={handleToggleAccountType}
              />
            </div>
          </div>
        )}
      </div>

      {/* Address details */}
      <div className="space-y-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-sm font-medium w-full text-left"
        >
          {showDetails ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>Address Details</span>
        </button>

        {showDetails && (
          <div className="space-y-3 pl-6">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Address</div>
              <div className="font-mono text-sm bg-muted p-2 rounded">
                {address}
              </div>
            </div>

            {walletInfo?.hasPrivy && walletInfo?.hasZeroDev && (
              <>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Smart Account</div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {truncateAddress(address)} {/* This would be the smart account address */}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">EOA Address</div>
                  <div className="font-mono text-sm bg-muted p-2 rounded">
                    {truncateAddress(address)} {/* This would be the EOA address */}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Smart account info (if applicable) */}
      {isSmartAccount && (
        <div className="space-y-3">
          <div className="text-sm font-medium">Smart Account Info</div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sponsored Transactions</span>
              <span>{walletInfo?.isSponsoredEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Project ID</span>
              <span className="font-mono text-xs">
                {walletInfo?.projectId ? truncateAddress(walletInfo.projectId) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Export/Manage */}
      {onRequestExport && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Wallet Management</div>
          <Button
            variant="outline"
            onClick={onRequestExport}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {strings.exportWallet}
          </Button>
          <div className="text-xs text-muted-foreground">
            Export private keys or manage wallet custody
          </div>
        </div>
      )}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && walletInfo && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Debug Info</div>
          <div className="p-3 bg-muted rounded-lg">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(walletInfo, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-1">Account Types:</div>
          <ul className="space-y-1 text-xs">
            <li>• <strong>EOA:</strong> Standard Ethereum wallet with private key</li>
            <li>• <strong>Smart Account:</strong> Contract wallet with advanced features</li>
            <li>• Smart accounts can use sponsored transactions (gasless)</li>
            <li>• Both types can send, receive, and sign messages</li>
          </ul>
        </div>
      </div>
    </div>
  )
}