import { vi } from 'vitest'
import type { PrivyClientLike } from '../../types'

// Deterministic test data
export const FAKE_PRIVY_ADDRESS = '0x00EEaabbccddEEaabbccddEEaabbccddEEaabbcc'
export const FAKE_SIGNATURE = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c'
export const FAKE_TX_HASH = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'

export interface FakePrivyAdapter extends PrivyClientLike {
  // Test utilities
  _callCounts: {
    getAddress: number
    signMessage: number
    sendTransaction: number
    login: number
    logout: number
  }
  _setAuthenticated: (authenticated: boolean) => void
  _setReady: (ready: boolean) => void
  _setUser: (user: any) => void
  signTypedData: (params: any) => Promise<string>
}

export function createFakePrivyAdapter(): FakePrivyAdapter {
  const callCounts = {
    getAddress: 0,
    signMessage: 0,
    sendTransaction: 0,
    login: 0,
    logout: 0,
  }

  let authenticated = true
  let ready = true
  let user = {
    wallet: {
      address: FAKE_PRIVY_ADDRESS,
    },
  }

  return {
    user,
    authenticated,
    ready,
    _callCounts: callCounts,

    async login() {
      callCounts.login++
      authenticated = true
      user = {
        wallet: {
          address: FAKE_PRIVY_ADDRESS,
        },
      }
    },

    async logout() {
      callCounts.logout++
      authenticated = false
      user = undefined as any
    },

    signTypedData: async (_params: any) => {
      return FAKE_SIGNATURE
    },

    getEthereumProvider() {
      return {
        request: async ({ method, params: _params }: { method: string; params?: any[] }) => {
          if (method === 'eth_accounts') {
            return [FAKE_PRIVY_ADDRESS]
          }
          if (method === 'eth_chainId') {
            return '0x1' // Ethereum mainnet
          }
          if (method === 'personal_sign') {
            callCounts.signMessage++
            return FAKE_SIGNATURE
          }
          if (method === 'eth_sendTransaction') {
            callCounts.sendTransaction++
            return FAKE_TX_HASH
          }
          if (method === 'eth_getBalance') {
            return '0x1bc16d674ec80000' // 2 ETH in wei
          }
          throw new Error(`Unsupported method: ${method}`)
        },
      }
    },

    // Test utilities
    _setAuthenticated(newAuthenticated: boolean) {
      authenticated = newAuthenticated
    },

    _setReady(newReady: boolean) {
      ready = newReady
    },

    _setUser(newUser: any) {
      user = newUser
    },
  }
}

// Additional utilities for testing
export const createMockPrivyProvider = () => ({
  user: {
    wallet: {
      address: FAKE_PRIVY_ADDRESS,
    },
  },
  authenticated: true,
  ready: true,
  login: vi.fn(),
  logout: vi.fn(),
  getEthereumProvider: vi.fn().mockReturnValue({
    request: vi.fn().mockImplementation(async ({ method }: { method: string; params?: any[] }) => {
      switch (method) {
        case 'eth_accounts':
          return [FAKE_PRIVY_ADDRESS]
        case 'eth_chainId':
          return '0x1'
        case 'personal_sign':
          return FAKE_SIGNATURE
        case 'eth_sendTransaction':
          return FAKE_TX_HASH
        case 'eth_getBalance':
          return '0x1bc16d674ec80000'
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
    }),
  }),
})
