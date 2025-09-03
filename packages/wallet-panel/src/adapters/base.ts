import type { Address, Hash, Hex } from 'viem'
import type { 
  WalletSigner, 
  SmartAccountSigner, 
  TransactionRequest, 
  SendTransactionResult 
} from '../types'

/**
 * Base adapter class that provides common functionality
 */
export abstract class BaseWalletAdapter implements WalletSigner {
  abstract getAddress(): Promise<Address>
  abstract signMessage(message: string): Promise<Hex>
  abstract sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult>
  abstract getChainId(): Promise<number>
  abstract switchChain?(chainId: number): Promise<void>

  /**
   * Check if the adapter is ready to use
   */
  abstract isReady(): boolean

  /**
   * Check if the adapter is connected
   */
  abstract isConnected(): boolean
}

/**
 * Base smart account adapter that extends wallet functionality
 */
export abstract class BaseSmartAccountAdapter extends BaseWalletAdapter implements SmartAccountSigner {
  abstract getSmartAccountAddress(): Promise<Address>
  abstract sendUserOp(tx: TransactionRequest): Promise<SendTransactionResult>
  abstract isSponsoredEnabled(): boolean
  abstract setSponsored(enabled: boolean): void
  abstract getNonce?(): Promise<bigint>
  abstract getOwners?(): Promise<Address[]>

  /**
   * Prefer smart account address over EOA address
   */
  async getAddress(): Promise<Address> {
    return this.getSmartAccountAddress()
  }

  /**
   * Prefer user operations over regular transactions
   */
  async sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult> {
    return this.sendUserOp(tx)
  }
}