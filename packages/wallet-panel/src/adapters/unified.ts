import type { Address, Hash, Hex } from 'viem'
import type { 
  WalletSigner,
  SmartAccountSigner,
  PrivyClientLike,
  ZeroDevContextLike,
  TransactionRequest,
  SendTransactionResult
} from '../types'
import { PrivyAdapter } from './privy'
import { ZeroDevAdapter } from './zerodev'

export type WalletAdapterMode = 'privy-only' | 'zerodev-only' | 'unified'

/**
 * Unified wallet adapter that orchestrates between Privy and ZeroDev
 * Provides a single interface that can work with either or both providers
 */
export class UnifiedWalletAdapter implements SmartAccountSigner {
  private privyAdapter?: PrivyAdapter
  private zerodevAdapter?: ZeroDevAdapter
  private mode: WalletAdapterMode
  private preferSmartAccount: boolean = true

  constructor(
    privyClient?: PrivyClientLike,
    zerodevContext?: ZeroDevContextLike
  ) {
    // Initialize adapters based on what's provided
    if (privyClient) {
      this.privyAdapter = new PrivyAdapter(privyClient)
    }
    
    if (zerodevContext) {
      this.zerodevAdapter = new ZeroDevAdapter(zerodevContext)
    }

    // Determine operating mode
    if (this.privyAdapter && this.zerodevAdapter) {
      this.mode = 'unified'
    } else if (this.zerodevAdapter) {
      this.mode = 'zerodev-only'
    } else if (this.privyAdapter) {
      this.mode = 'privy-only'
    } else {
      throw new Error('At least one adapter (Privy or ZeroDev) must be provided')
    }
  }

  /**
   * Get the active adapter based on current preferences
   */
  private getActiveAdapter(): WalletSigner {
    if (this.mode === 'privy-only') {
      return this.privyAdapter!
    }
    
    if (this.mode === 'zerodev-only') {
      return this.zerodevAdapter!
    }

    // Unified mode - prefer smart account if available and enabled
    if (this.preferSmartAccount && this.zerodevAdapter?.isReady()) {
      return this.zerodevAdapter
    }
    
    if (this.privyAdapter?.isReady()) {
      return this.privyAdapter
    }

    throw new Error('No active wallet adapter available')
  }

  /**
   * Get the smart account adapter (ZeroDev) if available
   */
  private getSmartAccountAdapter(): ZeroDevAdapter {
    if (!this.zerodevAdapter) {
      throw new Error('ZeroDev adapter not available')
    }
    return this.zerodevAdapter
  }

  /**
   * Check if any adapter is ready
   */
  isReady(): boolean {
    return (this.privyAdapter?.isReady() ?? false) || 
           (this.zerodevAdapter?.isReady() ?? false)
  }

  /**
   * Check if any adapter is connected
   */
  isConnected(): boolean {
    return (this.privyAdapter?.isConnected() ?? false) || 
           (this.zerodevAdapter?.isConnected() ?? false)
  }

  /**
   * Check if smart account is available and active
   */
  isSmartAccountActive(): boolean {
    return this.mode !== 'privy-only' && 
           this.preferSmartAccount && 
           (this.zerodevAdapter?.isReady() ?? false)
  }

  /**
   * Toggle between smart account and EOA
   */
  setPreferSmartAccount(prefer: boolean): void {
    if (this.mode === 'privy-only') {
      throw new Error('Smart account not available in Privy-only mode')
    }
    this.preferSmartAccount = prefer
  }

  /**
   * Get the current wallet address
   */
  async getAddress(): Promise<Address> {
    const adapter = this.getActiveAdapter()
    return adapter.getAddress()
  }

  /**
   * Get the smart account address (if available)
   */
  async getSmartAccountAddress(): Promise<Address> {
    const adapter = this.getSmartAccountAdapter()
    return adapter.getSmartAccountAddress()
  }

  /**
   * Get the EOA address (if available)
   */
  async getEOAAddress(): Promise<Address> {
    if (!this.privyAdapter) {
      throw new Error('Privy adapter not available')
    }
    return this.privyAdapter.getAddress()
  }

  /**
   * Sign a message with the active adapter
   */
  async signMessage(message: string): Promise<Hex> {
    const adapter = this.getActiveAdapter()
    return adapter.signMessage(message)
  }

  /**
   * Send a transaction with the active adapter
   */
  async sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult> {
    const adapter = this.getActiveAdapter()
    return adapter.sendTransaction(tx)
  }

  /**
   * Send a user operation (smart account only)
   */
  async sendUserOp(tx: TransactionRequest): Promise<SendTransactionResult> {
    const adapter = this.getSmartAccountAdapter()
    return adapter.sendUserOp(tx)
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    const adapter = this.getActiveAdapter()
    return adapter.getChainId()
  }

  /**
   * Switch chain
   */
  async switchChain(chainId: number): Promise<void> {
    const adapter = this.getActiveAdapter()
    if (adapter.switchChain) {
      await adapter.switchChain(chainId)
    } else {
      throw new Error('Chain switching not supported by active adapter')
    }
  }

  /**
   * Check if sponsored transactions are enabled
   */
  isSponsoredEnabled(): boolean {
    if (!this.zerodevAdapter) {
      return false
    }
    return this.zerodevAdapter.isSponsoredEnabled()
  }

  /**
   * Enable or disable sponsored transactions
   */
  setSponsored(enabled: boolean): void {
    if (!this.zerodevAdapter) {
      throw new Error('Sponsored transactions not available without ZeroDev')
    }
    this.zerodevAdapter.setSponsored(enabled)
  }

  /**
   * Get smart account nonce (if available)
   */
  async getNonce(): Promise<bigint> {
    const adapter = this.getSmartAccountAdapter()
    if (adapter.getNonce) {
      return adapter.getNonce()
    }
    throw new Error('Nonce not available')
  }

  /**
   * Get smart account owners (if available)
   */
  async getOwners(): Promise<Address[]> {
    const adapter = this.getSmartAccountAdapter()
    if (adapter.getOwners) {
      return adapter.getOwners()
    }
    throw new Error('Owners not available')
  }

  /**
   * Get wallet information
   */
  async getWalletInfo() {
    const isSmartAccount = this.isSmartAccountActive()
    
    return {
      mode: this.mode,
      isSmartAccount,
      address: await this.getAddress(),
      chainId: await this.getChainId(),
      isSponsoredEnabled: this.isSponsoredEnabled(),
      hasPrivy: !!this.privyAdapter,
      hasZeroDev: !!this.zerodevAdapter,
    }
  }

  /**
   * Login (Privy only)
   */
  async login(): Promise<void> {
    if (!this.privyAdapter) {
      throw new Error('Login requires Privy adapter')
    }
    await this.privyAdapter.login()
  }

  /**
   * Logout from all adapters
   */
  async logout(): Promise<void> {
    if (this.privyAdapter) {
      await this.privyAdapter.logout()
    }
    // ZeroDev logout would be handled here if needed
  }
}