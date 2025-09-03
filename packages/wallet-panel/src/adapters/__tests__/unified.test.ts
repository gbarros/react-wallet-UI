import { describe, it, expect } from 'vitest'
import { UnifiedWalletAdapter } from '../unified'
import { mockPrivyClient, mockZeroDevContext, mockDisconnectedPrivyClient } from '../../test/mocks'

describe('UnifiedWalletAdapter', () => {
  describe('initialization', () => {
    it('should create adapter with Privy only', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      const info = await adapter.getWalletInfo()
      expect(info.mode).toBe('privy-only')
    })

    it('should create adapter with ZeroDev only', async () => {
      const adapter = new UnifiedWalletAdapter(undefined, mockZeroDevContext)
      const info = await adapter.getWalletInfo()
      expect(info.mode).toBe('zerodev-only')
    })

    it('should create adapter with both providers', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      const info = await adapter.getWalletInfo()
      expect(info.mode).toBe('unified')
    })

    it('should throw error with no providers', () => {
      expect(() => new UnifiedWalletAdapter()).toThrow()
    })
  })

  describe('connection status', () => {
    it('should report ready when Privy is connected', () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      expect(adapter.isReady()).toBe(true)
      expect(adapter.isConnected()).toBe(true)
    })

    it('should report not ready when Privy is disconnected', () => {
      const adapter = new UnifiedWalletAdapter(mockDisconnectedPrivyClient)
      expect(adapter.isReady()).toBe(false) // not authenticated
      expect(adapter.isConnected()).toBe(false)
    })

    it('should prefer smart account when both are available', () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      expect(adapter.isSmartAccountActive()).toBe(true)
    })
  })

  describe('address management', () => {
    it('should return Privy address in Privy-only mode', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      const address = await adapter.getAddress()
      expect(address).toBe('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')
    })

    it('should return smart account address in unified mode', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      const address = await adapter.getAddress()
      expect(address).toBe('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')
    })

    it('should allow switching between account types', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      
      // Initially prefers smart account
      expect(adapter.isSmartAccountActive()).toBe(true)
      
      // Switch to EOA
      adapter.setPreferSmartAccount(false)
      expect(adapter.isSmartAccountActive()).toBe(false)
      
      // Switch back to smart account
      adapter.setPreferSmartAccount(true)
      expect(adapter.isSmartAccountActive()).toBe(true)
    })
  })

  describe('transaction handling', () => {
    it('should send transaction via Privy in Privy-only mode', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      
      const result = await adapter.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: 1000000000000000000n, // 1 ETH
      })
      
      expect(result.hash).toBe('0x' + '1'.repeat(64))
      expect(result.userOpHash).toBeUndefined()
    })

    it('should send user operation via ZeroDev in unified mode', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      
      const result = await adapter.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        value: 1000000000000000000n,
      })
      
      expect(result.hash).toBe('0x' + '2'.repeat(64))
      expect(result.userOpHash).toBe('0x' + '3'.repeat(64))
    })
  })

  describe('message signing', () => {
    it('should sign message via active adapter', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      
      const signature = await adapter.signMessage('Hello, world!')
      expect(signature).toBe('0x' + '0'.repeat(130))
    })
  })

  describe('sponsored transactions', () => {
    it('should handle sponsored transaction settings', () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      
      // Initially enabled
      expect(adapter.isSponsoredEnabled()).toBe(true)
      
      // Disable sponsored transactions
      adapter.setSponsored(false)
      expect(adapter.isSponsoredEnabled()).toBe(false)
      
      // Re-enable
      adapter.setSponsored(true)
      expect(adapter.isSponsoredEnabled()).toBe(true)
    })

    it('should throw error when setting sponsored without ZeroDev', () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient)
      
      expect(() => adapter.setSponsored(true)).toThrow()
    })
  })

  describe('wallet info', () => {
    it('should return comprehensive wallet information', async () => {
      const adapter = new UnifiedWalletAdapter(mockPrivyClient, mockZeroDevContext)
      
      const info = await adapter.getWalletInfo()
      
      expect(info).toMatchObject({
        mode: 'unified',
        isSmartAccount: true,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        hasPrivy: true,
        hasZeroDev: true,
      })
    })
  })
})