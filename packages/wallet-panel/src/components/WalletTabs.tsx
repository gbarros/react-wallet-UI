import React from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, PenTool, Link, Settings } from 'lucide-react'
import type { WalletState, LocaleStrings, Erc20 } from '../types'
import type { UnifiedWalletAdapter } from '../adapters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { BalancesTab } from './BalancesTab'
import { ReceiveTab } from './ReceiveTab'
import { SendTab } from './SendTab'
import { SignTab } from './SignTab'
import { WalletConnectTab } from './WalletConnectTab'
import { AdvancedTab } from './AdvancedTab'

interface WalletTabsProps {
  adapter: UnifiedWalletAdapter | null
  walletState: WalletState
  tokens: Erc20[]
  enableSponsoredTx: boolean
  showWalletConnect: boolean
  strings: LocaleStrings
  onTxSubmitted?: (hashOrUserOp: string) => void
  onTxConfirmed?: (receipt: unknown) => void
  onSign?: (sig: string, message: string) => void
  onRequestExport?: () => void
}

/**
 * Main tabs component that contains all wallet functionality
 */
export function WalletTabs({
  adapter,
  walletState,
  tokens,
  enableSponsoredTx,
  showWalletConnect,
  strings,
  onTxSubmitted,
  onTxConfirmed,
  onSign,
  onRequestExport,
}: WalletTabsProps) {
  return (
    <Tabs defaultValue="balances" className="w-full">
      <TabsList className="grid w-full grid-cols-5 p-1">
        <TabsTrigger value="balances" className="flex flex-col items-center py-2">
          <Wallet className="h-4 w-4" />
          <span className="text-xs mt-1">{strings.balances}</span>
        </TabsTrigger>
        
        <TabsTrigger value="receive" className="flex flex-col items-center py-2">
          <ArrowDownLeft className="h-4 w-4" />
          <span className="text-xs mt-1">{strings.receive}</span>
        </TabsTrigger>
        
        <TabsTrigger value="send" className="flex flex-col items-center py-2">
          <ArrowUpRight className="h-4 w-4" />
          <span className="text-xs mt-1">{strings.send}</span>
        </TabsTrigger>
        
        <TabsTrigger value="sign" className="flex flex-col items-center py-2">
          <PenTool className="h-4 w-4" />
          <span className="text-xs mt-1">{strings.sign}</span>
        </TabsTrigger>
        
        <TabsTrigger value="more" className="flex flex-col items-center py-2">
          <Settings className="h-4 w-4" />
          <span className="text-xs mt-1">More</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="balances" className="mt-0">
        <BalancesTab
          walletState={walletState}
          strings={strings}
          onRefresh={walletState.refreshWalletData}
        />
      </TabsContent>

      <TabsContent value="receive" className="mt-0">
        <ReceiveTab
          address={walletState.address}
          strings={strings}
        />
      </TabsContent>

      <TabsContent value="send" className="mt-0">
        <SendTab
          adapter={adapter}
          walletState={walletState}
          tokens={tokens}
          enableSponsoredTx={enableSponsoredTx}
          strings={strings}
          onTxSubmitted={onTxSubmitted}
        />
      </TabsContent>

      <TabsContent value="sign" className="mt-0">
        <SignTab
          adapter={adapter}
          strings={strings}
          onSign={onSign}
        />
      </TabsContent>

      <TabsContent value="more" className="mt-0">
        <Tabs defaultValue="advanced" className="w-full">
          <TabsList className="grid w-full grid-cols-2 p-1">
            <TabsTrigger value="advanced" className="text-xs">
              {strings.advanced}
            </TabsTrigger>
            {showWalletConnect && (
              <TabsTrigger value="walletconnect" className="text-xs">
                WalletConnect
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="advanced" className="mt-0">
            <AdvancedTab
              adapter={adapter}
              address={walletState.address}
              isSmartAccount={walletState.isSmartAccount}
              strings={strings}
              onRequestExport={onRequestExport}
            />
          </TabsContent>

          {showWalletConnect && (
            <TabsContent value="walletconnect" className="mt-0">
              <WalletConnectTab
                address={walletState.address}
                strings={strings}
              />
            </TabsContent>
          )}
        </Tabs>
      </TabsContent>
    </Tabs>
  )
}