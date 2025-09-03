// import React from 'react' // Not needed with new JSX transform
import { Wallet } from 'lucide-react'
import { Button } from './ui/button'
import type { LocaleStrings } from '../types'

interface ConnectPromptProps {
  onConnect: () => void
  strings: LocaleStrings
  isLoading?: boolean
}

/**
 * Component shown when wallet is not connected
 */
export function ConnectPrompt({ onConnect, strings, isLoading }: ConnectPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 p-3 rounded-full bg-muted">
        <Wallet className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">
        {strings.connect}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-6">
        Connect your wallet to view balances and manage assets
      </p>
      
      <Button 
        onClick={onConnect}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Connecting...' : strings.connect}
      </Button>
    </div>
  )
}