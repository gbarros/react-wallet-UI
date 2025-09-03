import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { Address } from '../types'
import type { ChainConfig, LocaleStrings } from '../types'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { truncateAddress, generateIdenticon, copyToClipboard } from '../lib/utils'

interface WalletHeaderProps {
  address?: Address
  chainId?: number
  isSmartAccount: boolean
  showChainSelector: boolean
  chains: ChainConfig[]
  strings: LocaleStrings
  onChainChange: (chainId: number) => void
}

/**
 * Wallet header with address, identicon, and chain selector
 */
export function WalletHeader({
  address,
  chainId,
  isSmartAccount,
  showChainSelector,
  chains,
  strings,
  onChainChange,
}: WalletHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!address) return
    
    const success = await copyToClipboard(address)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const currentChain = chains.find(chain => chain.id === chainId)

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Identicon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: generateIdenticon(address || '') }}
          >
            {address ? address.slice(2, 4).toUpperCase() : '??'}
          </div>
          
          {/* Address and account type */}
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">
                {address ? truncateAddress(address) : 'Not connected'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                disabled={!address}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              {isSmartAccount ? strings.smartAccount : strings.eoaAccount}
            </div>
          </div>
        </div>
      </div>

      {/* Chain selector */}
      {showChainSelector && chains.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Network</span>
          <Select
            value={chainId?.toString()}
            onValueChange={(value) => onChainChange(parseInt(value))}
          >
            <SelectTrigger className="w-auto min-w-[120px]">
              <SelectValue placeholder="Select chain">
                {currentChain?.name || `Chain ${chainId}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  <div className="flex items-center space-x-2">
                    {chain.logoUrl && (
                      <img 
                        src={chain.logoUrl} 
                        alt={chain.name} 
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span>{chain.name || `Chain ${chain.id}`}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}