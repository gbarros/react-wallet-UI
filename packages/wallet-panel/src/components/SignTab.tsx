import React, { useState } from 'react'
import { PenTool, Copy, Check, AlertCircle } from 'lucide-react'
import type { LocaleStrings } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Input } from './ui/input'
import { copyToClipboard } from '../lib/utils'

interface SignTabProps {
  adapter: UnifiedWalletAdapter | null
  strings: LocaleStrings
  onSign?: (signature: string, message: string) => void
}

/**
 * Component for signing arbitrary messages
 */
export function SignTab({ adapter, strings, onSign }: SignTabProps) {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSign = async () => {
    if (!adapter || !message.trim()) return

    setIsLoading(true)
    setError('')
    setSignature('')

    try {
      const sig = await adapter.signMessage(message.trim())
      setSignature(sig)
      onSign?.(sig, message.trim())
    } catch (err) {
      console.error('Message signing failed:', err)
      setError(err instanceof Error ? err.message : 'Signing failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopySignature = async () => {
    if (!signature) return
    
    const success = await copyToClipboard(signature)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClear = () => {
    setMessage('')
    setSignature('')
    setError('')
    setCopied(false)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{strings.signTitle}</h3>
        <p className="text-sm text-muted-foreground">
          Sign a message to prove ownership of your wallet
        </p>
      </div>

      {/* Message input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{strings.message}</label>
        <Textarea
          placeholder="Enter message to sign..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="resize-none"
        />
        <div className="text-xs text-muted-foreground">
          {message.length} characters
        </div>
      </div>

      {/* Sign button */}
      <Button
        onClick={handleSign}
        disabled={!message.trim() || isLoading || !adapter}
        className="w-full"
      >
        {isLoading ? (
          <>
            <PenTool className="h-4 w-4 mr-2 animate-pulse" />
            {strings.signing}
          </>
        ) : (
          <>
            <PenTool className="h-4 w-4 mr-2" />
            {strings.sign}
          </>
        )}
      </Button>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        </div>
      )}

      {/* Signature result */}
      {signature && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{strings.signature}</label>
          <div className="relative">
            <Input
              value={signature}
              readOnly
              className="font-mono text-xs pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-8 w-8"
              onClick={handleCopySignature}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          {copied && (
            <div className="text-sm text-green-600">
              {strings.copied}
            </div>
          )}
        </div>
      )}

      {/* Clear button */}
      {(message || signature) && (
        <Button
          variant="outline"
          onClick={handleClear}
          className="w-full"
        >
          Clear
        </Button>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-1">About message signing:</div>
          <ul className="space-y-1 text-xs">
            <li>• Signing proves you control this wallet address</li>
            <li>• The signature can be verified by anyone</li>
            <li>• This does not authorize any transactions</li>
            <li>• Never sign messages from untrusted sources</li>
          </ul>
        </div>
      </div>
    </div>
  )
}