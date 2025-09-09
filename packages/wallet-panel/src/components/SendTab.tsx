import React, { useState, useMemo, useEffect } from 'react'
import { Send, AlertCircle } from 'lucide-react'
import type { Address } from '../types'
import type { WalletState, LocaleStrings, Erc20, SendFormData } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { isValidAddress, isValidENS, parseBalance } from '../lib/utils'

interface SendTabProps {
  adapter: UnifiedWalletAdapter | null
  walletState: WalletState
  tokens: Erc20[]
  enableSponsoredTx: boolean
  strings: LocaleStrings
  onTxSubmitted?: (hashOrUserOp: string) => void
}

/**
 * Component for sending transactions
 */
export function SendTab({
  adapter,
  walletState,
  tokens,
  enableSponsoredTx,
  strings,
  onTxSubmitted,
}: SendTabProps) {
  const [formData, setFormData] = useState<SendFormData>({
    to: '',
    recipient: '',
    amount: '',
    asset: 'native',
    useSponsored: enableSponsoredTx,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Available assets for sending
  const availableAssets = useMemo(() => {
    const assets = []
    
    // Native token
    if (walletState.nativeBalance) {
      assets.push({
        id: 'native',
        symbol: walletState.nativeBalance.symbol,
        balance: walletState.nativeBalance.balance,
        formatted: walletState.nativeBalance.formatted,
        decimals: 18, // Assuming 18 decimals for native token
      })
    }
    
    // ERC-20 tokens
    walletState.tokenBalances.forEach(tokenBalance => {
      assets.push({
        id: tokenBalance.token.address,
        symbol: tokenBalance.token.symbol,
        balance: tokenBalance.balance,
        formatted: tokenBalance.formatted,
        decimals: tokenBalance.token.decimals,
      })
    })
    
    return assets
  }, [walletState])

  const selectedAsset = availableAssets.find(asset => asset.id === formData.asset)

  // Ensure a valid default asset is selected based on availability
  useEffect(() => {
    if (!availableAssets.find(a => a.id === formData.asset) && availableAssets.length > 0) {
      setFormData(prev => ({ ...prev, asset: availableAssets[0].id }))
    }
  }, [availableAssets, formData.asset])

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = []
    
    if (!formData.to) {
      errors.push('Recipient address is required')
    } else if (!isValidAddress(formData.to) && !isValidENS(formData.to)) {
      errors.push('Invalid recipient address')
    }
    
    if (!formData.amount) {
      errors.push('Amount is required')
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.push('Invalid amount')
    } else if (selectedAsset) {
      const amountBigInt = parseBalance(formData.amount, selectedAsset.decimals)
      if (amountBigInt > selectedAsset.balance) {
        errors.push('Insufficient balance')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    }
  }, [formData, selectedAsset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adapter || !validation.isValid) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const amount = parseBalance(formData.amount, selectedAsset?.decimals || 18)
      
      let txRequest
      if (formData.asset === 'native') {
        // Native token transfer
        txRequest = {
          to: formData.to as Address,
          value: amount,
        }
      } else {
        // ERC-20 transfer
        const token = tokens.find(t => t.address === formData.asset)
        if (!token) throw new Error('Token not found')
        
        // Encode ERC-20 transfer call
        const transferData = `0xa9059cbb${
          formData.to.slice(2).padStart(64, '0')
        }${amount.toString(16).padStart(64, '0')}`
        
        txRequest = {
          to: token.address,
          data: transferData as `0x${string}`,
        }
      }
      
      // Set sponsored mode if enabled
      if (enableSponsoredTx && adapter.isSponsoredEnabled() !== formData.useSponsored) {
        adapter.setSponsored(formData.useSponsored || false)
      }
      
      const result = await adapter.sendTransaction(txRequest)
      
      onTxSubmitted?.(result.userOpHash || result.hash)
      
      // Reset form on success
      setFormData({
        to: '',
        recipient: '',
        amount: '',
        asset: 'native',
        useSponsored: enableSponsoredTx,
      })
      
    } catch (err) {
      console.error('Send transaction failed:', err)
      setError(err instanceof Error ? err.message : 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{strings.sendTitle}</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{strings.recipient}</label>
          <Input
            placeholder="0x... or name.eth"
            value={formData.to}
            onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
            className={!validation.isValid && formData.to ? 'border-destructive' : ''}
          />
        </div>

        {/* Asset selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{strings.asset}</label>
          <Select
            value={formData.asset}
            onValueChange={(value) => setFormData(prev => ({ ...prev, asset: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{asset.symbol}</span>
                    <span className="text-muted-foreground ml-2">
                      {asset.formatted}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">{strings.amount}</label>
            {selectedAsset && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  amount: selectedAsset.formatted 
                }))}
              >
                Max: {selectedAsset.formatted} {selectedAsset.symbol}
              </button>
            )}
          </div>
          <Input
            type="number"
            step="any"
            placeholder="0.0"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className={!validation.isValid && formData.amount ? 'border-destructive' : ''}
          />
        </div>

        {/* Gas mode (sponsored transactions) */}
        {enableSponsoredTx && (
          <div className="space-y-2">
            <label className="text-sm font-medium">{strings.gasMode}</label>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="text-sm font-medium">
                  {formData.useSponsored ? strings.sponsored : strings.userPays}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formData.useSponsored 
                    ? 'Transaction fees covered by paymaster' 
                    : 'You pay transaction fees'
                  }
                </div>
              </div>
              <Switch
                checked={formData.useSponsored}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, useSponsored: checked }))
                }
              />
            </div>
          </div>
        )}

        {/* Error display */}
        {(error || !validation.isValid) && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                {error || validation.errors[0]}
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={!validation.isValid || isLoading || !adapter}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-pulse" />
              {strings.sending}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {strings.sendButton}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
