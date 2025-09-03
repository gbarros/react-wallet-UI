import type { Address, Hash, Hex } from '../types'
import type { 
  PrivyClientLike, 
  TransactionRequest, 
  SendTransactionResult 
} from '../types'
import { BaseWalletAdapter } from './base'

/**
 * Adapter for Privy embedded wallet
 * Provides EOA wallet functionality through Privy's SDK
 */
export class PrivyAdapter extends BaseWalletAdapter {
  private client: PrivyClientLike
  private provider: any

  constructor(client: PrivyClientLike) {
    super()
    this.client = client
    this.provider = null
  }

  /**
   * Initialize the Ethereum provider from Privy
   */
  private async getProvider() {
    if (!this.provider && this.client.authenticated) {
      this.provider = this.client.getEthereumProvider()
    }
    return this.provider
  }

  /**
   * Check if Privy is ready and authenticated
   */
  isReady(): boolean {
    return this.client.ready && this.client.authenticated
  }

  /**
   * Check if user is connected via Privy
   */
  isConnected(): boolean {
    return this.client.authenticated && !!this.client.user?.wallet?.address
  }

  /**
   * Get the user's wallet address from Privy
   */
  async getAddress(): Promise<Address> {
    if (!this.isConnected()) {
      throw new Error('Privy wallet not connected')
    }

    const address = this.client.user?.wallet?.address
    if (!address) {
      throw new Error('No wallet address available')
    }

    return address as Address
  }

  /**
   * Sign a message using Privy's wallet
   */
  async signMessage(message: string): Promise<Hex> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('Privy provider not available')
    }

    try {
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, await this.getAddress()],
      })
      return signature as Hex
    } catch (error) {
      throw new Error(`Failed to sign message: ${error}`)
    }
  }

  /**
   * Send a transaction using Privy's wallet
   */
  async sendTransaction(tx: TransactionRequest): Promise<SendTransactionResult> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('Privy provider not available')
    }

    try {
      const txParams = {
        to: tx.to,
        value: tx.value ? `0x${tx.value.toString(16)}` : undefined,
        data: tx.data,
        from: await this.getAddress(),
      }

      const hash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      })

      return { hash: hash as Hash }
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error}`)
    }
  }

  /**
   * Get current chain ID
   */
  async getChainId(): Promise<number> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('Privy provider not available')
    }

    try {
      const chainId = await provider.request({
        method: 'eth_chainId',
      })
      return parseInt(chainId, 16)
    } catch (error) {
      throw new Error(`Failed to get chain ID: ${error}`)
    }
  }

  /**
   * Switch to a different chain
   */
  async switchChain(chainId: number): Promise<void> {
    const provider = await this.getProvider()
    if (!provider) {
      throw new Error('Privy provider not available')
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })
    } catch (error: any) {
      // If chain is not added, try to add it
      if (error.code === 4902) {
        throw new Error(`Chain ${chainId} not configured. Please add it manually.`)
      }
      throw new Error(`Failed to switch chain: ${error}`)
    }
  }

  /**
   * Login via Privy
   */
  async login(): Promise<void> {
    if (!this.client.ready) {
      throw new Error('Privy client not ready')
    }
    
    await this.client.login()
  }

  /**
   * Logout from Privy
   */
  async logout(): Promise<void> {
    await this.client.logout()
    this.provider = null
  }
}