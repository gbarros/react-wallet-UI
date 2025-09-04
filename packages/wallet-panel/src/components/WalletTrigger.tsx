import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { WalletModal } from './WalletModal'
import type { WalletPanelProps } from '../types'

interface WalletTriggerProps extends Omit<WalletPanelProps, 'className'> {
  trigger?: React.ReactNode
  triggerClassName?: string
  modalTitle?: string
}

/**
 * Trigger component that opens WalletPanel in a modal
 * Provides a button that opens the wallet in an overlay, similar to Privy's approach
 */
export function WalletTrigger({
  trigger,
  triggerClassName = "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium",
  modalTitle = "Wallet",
  ...walletPanelProps
}: WalletTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const defaultTrigger = (
    <button
      className={triggerClassName}
      onClick={() => setIsOpen(true)}
    >
      <Wallet className="h-4 w-4 mr-2" />
      Open Wallet
    </button>
  )

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}
      
      <WalletModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={modalTitle}
        {...walletPanelProps}
      />
    </>
  )
}
