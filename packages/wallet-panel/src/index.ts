// Main components
export { WalletPanel } from './components/WalletPanel'
export { WalletModal } from './components/WalletModal'
export { WalletTrigger } from './components/WalletTrigger'

// Types
export type {
  WalletPanelProps,
  ChainConfig,
  Erc20,
  LocaleStrings,
  WalletState,
  SendFormData,
  SimpleWalletConfig,
  PrivyClientLike,
  ZeroDevContextLike,
  WalletSigner,
  SmartAccountSigner,
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
export { useSimpleWalletSetup } from './hooks/useSimpleWalletSetup'

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