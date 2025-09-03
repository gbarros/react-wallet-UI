// Main exports
export { WalletPanel } from './components/WalletPanel'

// Types
export type {
  WalletPanelProps,
  ChainConfig,
  Erc20,
  LocaleStrings,
  WalletState,
  SendFormData,
} from './types'

// Adapters (for advanced usage)
export {
  UnifiedWalletAdapter,
  PrivyAdapter,
  ZeroDevAdapter,
  type WalletAdapterMode,
} from './adapters'

// Hooks (for custom implementations)
export { useWalletAdapter } from './hooks/useWalletAdapter'
export { useWalletState } from './hooks/useWalletState'

// Utilities
export {
  truncateAddress,
  formatBalance,
  parseBalance,
  isValidAddress,
  isValidENS,
  generateIdenticon,
  copyToClipboard,
} from './lib/utils'

// Default locale strings
export { DEFAULT_LOCALE_STRINGS } from './types'