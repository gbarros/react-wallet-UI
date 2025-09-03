import { useState, useEffect } from 'react'
import { Link, ExternalLink, AlertCircle } from 'lucide-react'
import type { Address } from '../types'
import type { LocaleStrings } from '../types'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface WalletConnectTabProps {
  address?: Address
  strings: LocaleStrings
}

/**
 * Component for WalletConnect integration
 * Allows connecting the wallet to external dApps
 */
export function WalletConnectTab({ address }: WalletConnectTabProps) {
  const [wcUri, setWcUri] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const [connectedSessions, setConnectedSessions] = useState<any[]>([])

  // Initialize WalletConnect modal (if available)
  useEffect(() => {
    // This would initialize WalletConnect modal
    // For now, we'll just simulate the functionality
    loadConnectedSessions()
  }, [])

  const loadConnectedSessions = async () => {
    try {
      // This would load actual WalletConnect sessions
      // For now, we'll just set an empty array
      setConnectedSessions([])
    } catch (error) {
      console.error('Failed to load WalletConnect sessions:', error)
    }
  }

  const handleConnect = async () => {
    if (!wcUri.trim() || !address) return

    setIsConnecting(true)
    setError('')

    try {
      // This would use the actual WalletConnect modal
      // For now, we'll simulate the connection
      
      // Check if WalletConnect is available
      if (typeof window !== 'undefined') {
        try {
          // Dynamic import to avoid SSR issues
          await import('@walletconnect/modal')
          
          // This is a simplified example - actual implementation would be more complex
          console.log('Connecting to WalletConnect URI:', wcUri)
          
          // Simulate connection delay
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Clear URI on successful connection
          setWcUri('')
          
          // Reload sessions
          await loadConnectedSessions()
          
        } catch (importError) {
          throw new Error('WalletConnect not available. Please install @walletconnect/modal.')
        }
      } else {
        throw new Error('WalletConnect requires a browser environment')
      }
      
    } catch (err) {
      console.error('WalletConnect connection failed:', err)
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async (sessionId: string) => {
    try {
      // This would disconnect the specific session
      console.log('Disconnecting session:', sessionId)
      await loadConnectedSessions()
    } catch (error) {
      console.error('Failed to disconnect session:', error)
    }
  }

  const openWalletConnectModal = async () => {
    try {
      if (typeof window !== 'undefined') {
        // This would open the WalletConnect modal for scanning QR codes
        await import('@walletconnect/modal')
        console.log('Opening WalletConnect modal...')
        // Actual implementation would open the modal here
      }
    } catch (error) {
      setError('WalletConnect modal not available')
    }
  }

  if (!address) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">Wallet not connected</div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">WalletConnect</h3>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to external dApps using WalletConnect
        </p>
      </div>

      {/* Quick connect button */}
      <Button
        onClick={openWalletConnectModal}
        className="w-full"
        variant="outline"
      >
        <Link className="h-4 w-4 mr-2" />
        Scan QR Code to Connect
      </Button>

      {/* Manual URI input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Or paste WalletConnect URI</label>
        <div className="flex space-x-2">
          <Input
            placeholder="wc:..."
            value={wcUri}
            onChange={(e) => setWcUri(e.target.value)}
            className="font-mono text-sm"
          />
          <Button
            onClick={handleConnect}
            disabled={!wcUri.trim() || isConnecting}
            size="sm"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
            <div className="text-sm text-destructive">{error}</div>
          </div>
        </div>
      )}

      {/* Connected sessions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Connected dApps</label>
          {connectedSessions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={loadConnectedSessions}
            >
              Refresh
            </Button>
          )}
        </div>
        
        {connectedSessions.length > 0 ? (
          <div className="space-y-2">
            {connectedSessions.map((session, index) => (
              <div
                key={session.id || index}
                className="p-3 border border-border rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  {session.icon && (
                    <img
                      src={session.icon}
                      alt={session.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{session.name || 'Unknown dApp'}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.url || 'No URL'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {session.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(session.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDisconnect(session.id)}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Link className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No connected dApps</div>
            <div className="text-xs">Connect to dApps to see them here</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <div className="font-medium mb-1">How WalletConnect works:</div>
          <ul className="space-y-1 text-xs">
            <li>• Scan QR codes or paste URIs from dApps</li>
            <li>• Your wallet stays secure on your device</li>
            <li>• Approve or reject transaction requests</li>
            <li>• Disconnect anytime to revoke access</li>
          </ul>
        </div>
      </div>
    </div>
  )
}