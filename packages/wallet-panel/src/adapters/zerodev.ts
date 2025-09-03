import type { Address, Hash, Hex } from 'viem'
import type { 
  ZeroDevContextLike, 
  TransactionRequest, 
  SendTransactionResult 
} from '../types'
import { BaseSmartAccountAdapter } from './base'

/**
 * Adapter for ZeroDev smart account functionality
 * Provides AA features like sponsored transactions and user operations
 */
export class ZeroDevAdapter extends BaseSmartAccountAdapter {
  private context: ZeroDevContextLike
  private sponsoredEnabled: boolean = true

  constructor(context: ZeroDevContextLike) {
    super()
    this.context = context
  }

  /**
   * Check if ZeroDev is ready
   */
  isReady(): boolean {
    return !!this.context.projectId && this.context.isConnected
  }

  /**
   * Check if smart account is connected
   */
  isConnected(): boolean {
    return this.context.isConnected && !!this.context.address
  }

  /**
   * Get the smart account address
   */
  async getSmartAccountAddress(): Promise<Address> {
    if (!this.isConnected()) {
      throw new Error('ZeroDev smart account not connected')
    }

    if (!this.context.address) {
      throw new Error('No smart account address available')
    }

    return this.context.address
  }

  /**
   * Get the EOA address (fallback to smart account if not available)
   */
  async getAddress(): Promise<Address> {
    return this.getSmartAccountAddress()
  }

  /**
   * Sign a message using the smart account
   * Note: This might need to be implemented differently based on ZeroDev's API
   */
  async signMessage(message: string): Promise<Hex> {
    if (!this.isConnected()) {
      throw new Error('ZeroDev smart account not connected')
    }

    try {
      // This is a placeholder - actual implementation depends on ZeroDev's signing API
      // You might need to use the underlying EOA signer or a specific smart account signing method
      throw new Error('Smart account message signing not yet implemented')
    } catch (error) {
      throw new Error(`Failed to sign message with smart account: ${error}`)
    }
  }

  /**
   * Send a user operation via ZeroDev
   */
  async sendUserOp(tx: TransactionRequest): Promise<SendTransactionResult> {
    if (!this.isConnected()) {
      throw new Error('ZeroDev smart account not connected')
    }

    if (!this.context.sendUserOperation) {
      throw new Error('ZeroDev sendUserOperation not available')
    }

    try {
      const userOpParams = {
        to: tx.to,
        value: tx.value || 0n,
        data: tx.data || '0x',
      }

      const result = await this.context.sendUserOperation(userOpParams)
      
      // ZeroDev typically returns both userOpHash and eventual txHash
      return {
        hash: result.hash as Hash,
        userOpHash: result.userOpHash,
      }
    } catch (error) {
      throw new Error(`Failed to send user operation: ${error}`)
    }
  }

  /**
   * Send transaction (delegates to sendUserOp for smart accounts)
   */
  async sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult> {
    return this.sendUserOp(tx)
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    // This would need to be implemented based on ZeroDev's API
    // For now, we'll throw an error to indicate it needs implementation
    throw new Error('getChainId not implemented for ZeroDev adapter')
  }

  /**
   * Switch chain for smart account
   */
  async switchChain(chainId: number): Promise<void> {
    if (!this.context.switchChain) {
      throw new Error('Chain switching not supported by ZeroDev context')
    }

    try {
      await this.context.switchChain(chainId)
    } catch (error) {
      throw new Error(`Failed to switch chain: ${error}`)
    }
  }

  /**
   * Check if sponsored transactions are enabled
   */
  isSponsoredEnabled(): boolean {
    return this.sponsoredEnabled
  }

  /**
   * Enable or disable sponsored transactions
   */
  setSponsored(enabled: boolean): void {
    this.sponsoredEnabled = enabled
  }

  /**
   * Get the current nonce for the smart account
   */
  async getNonce(): Promise<bigint> {
    // This would need to be implemented based on ZeroDev's API
    // Typically involves reading from the smart account contract
    throw new Error('getNonce not implemented for ZeroDev adapter')
  }

  /**
   * Get the owners of the smart account
   */
  async getOwners(): Promise<Address[]> {
    // This would need to be implemented based on ZeroDev's API
    // Typically involves reading from the smart account contract
    throw new Error('getOwners not implemented for ZeroDev adapter')
  }

  /**
   * Get smart account metadata
   */
  async getAccountInfo() {
    return {
      address: await this.getSmartAccountAddress(),
      isSponsored: this.isSponsoredEnabled(),
      projectId: this.context.projectId,
    }
  }
}