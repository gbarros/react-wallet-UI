import { X } from 'lucide-react'
import { WalletPanel } from './WalletPanel'
import type { WalletPanelProps } from '../types'

interface WalletModalProps extends Omit<WalletPanelProps, 'className'> {
  isOpen: boolean
  onClose: () => void
  title?: string
}

/**
 * Modal wrapper for WalletPanel component
 * Provides overlay display similar to Privy's modal approach
 */
export function WalletModal({
  isOpen,
  onClose,
  title = "Wallet",
  ...walletPanelProps
}: WalletModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        {/* Modal Header */}
        <div className="bg-white rounded-t-lg px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Wallet Panel */}
        <WalletPanel
          {...walletPanelProps}
          className="rounded-t-none"
        />
      </div>
    </div>
  )
}
