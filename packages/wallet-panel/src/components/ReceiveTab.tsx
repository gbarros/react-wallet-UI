import { useState, useEffect, useRef } from 'react'
import { Copy, Check, QrCode } from 'lucide-react'
import type { Address } from '../types'
import type { LocaleStrings } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { copyToClipboard } from '../lib/utils'

interface ReceiveTabProps {
  address?: Address
  strings: LocaleStrings
}

/**
 * Component for receiving assets - shows address and QR code
 */
export function ReceiveTab({ address, strings }: ReceiveTabProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const copyResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Generate QR code for the address
  useEffect(() => {
    if (!address) return

    // Dynamically import qrcode to avoid SSR issues
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      }).then(setQrCodeUrl).catch(console.error)
    }).catch(console.error)
  }, [address])

  // Cleanup any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current)
        copyResetTimeoutRef.current = null
      }
    }
  }, [])

  const handleCopy = async () => {
    if (!address) return
    
    const success = await copyToClipboard(address)
    if (success) {
      setCopied(true)
      // Clear any existing timeout before setting a new one
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current)
      }
      copyResetTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!address) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">No address available</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{strings.receiveTitle}</h3>
        <p className="text-sm text-muted-foreground">{strings.receiveDescription}</p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        {qrCodeUrl ? (
          <div className="p-4 bg-white rounded-lg border border-border">
            <img 
              src={qrCodeUrl} 
              alt="Address QR Code" 
              className="w-48 h-48"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
            <QrCode className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Address</label>
        <div className="flex space-x-2">
          <Input
            value={address}
            readOnly
            className="font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {copied && (
          <div className="text-sm text-green-600">
            {strings.copied}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-1">How to receive:</div>
          <ul className="space-y-1 text-xs">
            <li>• Share this address with the sender</li>
            <li>• Or scan the QR code with their wallet</li>
            <li>• Make sure they're sending on the correct network</li>
          </ul>
        </div>
      </div>
    </div>
  )
}