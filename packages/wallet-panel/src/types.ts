// Re-export viem types to avoid conflicts
import type { Address, Hex, Hash, TransactionRequest } from 'viem'

export type { Address, Hex, Hash, TransactionRequest } from 'viem'

// Chain configuration - could use viem's Chain but we need additional fields
export interface ChainConfig {
  id: number
  rpcUrl?: string
  name?: string
  logoUrl?: string
}

// Token configuration
export interface Erc20 {
  address: Address
  symbol: string
  decimals: number
  logoUrl?: string
}

// Balance types
export interface NativeBalance {
  balance: bigint
  formatted: string
  symbol: string
}

export interface TokenBalance {
  token: Erc20
  balance: bigint
  formatted: string
}


export interface SendTransactionResult {
  hash: Hash
  userOpHash?: Hash
}

// Send form data
export interface SendFormData {
  to: string
  recipient: string
  amount: string
  asset: string
  tokenAddress?: Address
  useSponsored?: boolean
}

// Wallet state
export interface WalletState {
  isConnected: boolean
  address?: Address
  chainId?: number
  isSmartAccount: boolean
  nativeBalance?: NativeBalance
  tokenBalances: TokenBalance[]
  isLoading: boolean
  refreshWalletData: () => Promise<void>
}

// Locale strings for i18n
export interface LocaleStrings {
  // Navigation
  balances: string
  receive: string
  send: string
  sign: string
  advanced: string
  
  // Actions
  connect: string
  connecting: string
  disconnect: string
  copy: string
  copied: string
  refresh: string
  to: string
  amount: string
  asset: string
  gasMode: string
  sponsored: string
  userPays: string
  submit: string
  message: string
  signature: string
  signMessage: string
  qrCode: string
  
  // Account types
  smartAccount: string
  eoaAccount: string
  accountType: string
  owners: string
  nonce: string
  lastUserOp: string
  exportManage: string
  switchAccount: string
  chainSelector: string
  connectExternal: string
  pairing: string
  sessionTopic: string
  
  // Status
  error: string
  success: string
  pending: string
  confirmed: string
  failed: string
  
  // Validation
  invalidAddress: string
  invalidAmount: string
  insufficientBalance: string
  transactionFailed: string
  signatureFailed: string
  networkError: string
  unknownError: string
  
  // Send tab
  sendTitle: string
  recipient: string
  sending: string
  sendButton: string
  
  // Sign tab
  signTitle: string
  signing: string
  signButton: string
  
  // Receive tab
  receiveTitle: string
  receiveDescription: string
  
  // Advanced tab
  exportWallet: string
  
  // Balances tab
  noTokens: string
}

// Default locale strings
export const DEFAULT_LOCALE_STRINGS: LocaleStrings = {
  // Navigation
  balances: 'Balances',
  receive: 'Receive',
  send: 'Send',
  sign: 'Sign',
  advanced: 'Advanced',
  
  // Actions
  connect: 'Connect Wallet',
  connecting: 'Connecting...',
  disconnect: 'Disconnect',
  copy: 'Copy',
  copied: 'Copied!',
  refresh: 'Refresh',
  to: 'To',
  amount: 'Amount',
  asset: 'Asset',
  gasMode: 'Gas Mode',
  sponsored: 'Sponsored (Free)',
  userPays: 'User Pays',
  submit: 'Submit',
  message: 'Message',
  signature: 'Signature',
  signMessage: 'Sign Message',
  qrCode: 'QR Code',
  
  // Account types
  smartAccount: 'Smart Account',
  eoaAccount: 'EOA Account',
  accountType: 'Account Type',
  owners: 'Owners',
  nonce: 'Nonce',
  lastUserOp: 'Last UserOp',
  exportManage: 'Export / Manage',
  switchAccount: 'Switch Account',
  chainSelector: 'Chain',
  connectExternal: 'Connect External Dapp',
  pairing: 'Pairing',
  sessionTopic: 'Session Topic',
  
  // Status
  error: 'Error',
  success: 'Success',
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
  
  // Validation
  invalidAddress: 'Invalid address',
  invalidAmount: 'Invalid amount',
  insufficientBalance: 'Insufficient balance',
  transactionFailed: 'Transaction failed',
  signatureFailed: 'Signature failed',
  networkError: 'Network error',
  unknownError: 'Unknown error',
  
  // Send tab
  sendTitle: 'Send Assets',
  recipient: 'Recipient',
  sending: 'Sending...',
  sendButton: 'Send',
  
  // Sign tab
  signTitle: 'Sign Message',
  signing: 'Signing...',
  signButton: 'Sign',
  
  // Receive tab
  receiveTitle: 'Receive Assets',
  receiveDescription: 'Share your address to receive assets',
  
  // Advanced tab
  exportWallet: 'Export Wallet',
  
  // Balances tab
  noTokens: 'No tokens found',
}

// Adapter interfaces
export interface WalletSigner {
  getAddress(): Promise<Address>
  signMessage(message: string): Promise<Hex>
  sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult>
  getChainId(): Promise<number>
  switchChain?(chainId: number): Promise<void>
  isReady(): boolean
  isConnected(): boolean
}

export interface SmartAccountSigner extends WalletSigner {
  getSmartAccountAddress(): Promise<Address>
  sendUserOp(tx: TransactionRequest): Promise<SendTransactionResult>
  isSponsoredEnabled(): boolean
  setSponsored(enabled: boolean): void
  getNonce?(): Promise<bigint>
  getOwners?(): Promise<Address[]>
}

// Provider interfaces (for Privy and ZeroDev integration)
export interface PrivyClientLike {
  user?: {
    wallet?: {
      address: string
    }
  }
  authenticated: boolean
  ready: boolean
  login(): Promise<void>
  logout(): Promise<void>
  getEthereumProvider(): any
}

export interface ZeroDevContextLike {
  projectId: string
  isConnected: boolean
  address?: string
  sendUserOperation(tx: any): Promise<{ hash: string; userOpHash: string }>
  switchChain(chainId: number): Promise<void>
}

// Main component props
export interface WalletPanelProps {
  // Providers
  privyClient?: PrivyClientLike
  zerodev?: ZeroDevContextLike
  wagmiConfig?: any

  // UI/UX toggles
  showChainSelector?: boolean
  showWalletConnect?: boolean
  defaultCollapsed?: boolean

  // Assets and chains
  chains?: ChainConfig[]
  tokens?: Erc20[]

  // Sponsored transactions
  enableSponsoredTx?: boolean

  // Callbacks
  onRequestLogin?: () => void
  onTxSubmitted?: (hashOrUserOp: string) => void
  onTxConfirmed?: (receipt: unknown) => void
  onSign?: (sig: string, message: string) => void
  onRequestExport?: () => void

  // i18n
  localeStrings?: Partial<LocaleStrings>
  className?: string

  // For testing/integration
  adapter?: any
}
