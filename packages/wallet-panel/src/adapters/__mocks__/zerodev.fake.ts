import { vi } from 'vitest'
import type { ZeroDevContextLike } from '../../types'

// Deterministic test data
export const FAKE_ZERODEV_ADDRESS = '0x11FFaabbccddFFaabbccddFFaabbccddFFaabbcc'
export const FAKE_USER_OP_HASH = '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
export const FAKE_PROJECT_ID = 'test-zerodev-project-id'
export const FAKE_SIGNATURE = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1c'

export interface FakeZeroDevAdapter extends ZeroDevContextLike {
  // Test utilities
  _callCounts: {
    sendUserOperation: number
    switchChain: number
  }
  _setConnected: (connected: boolean) => void
  _setAddress: (address: string | undefined) => void
}

export function createFakeZeroDevAdapter(): FakeZeroDevAdapter {
  const callCounts = {
    sendUserOperation: 0,
    switchChain: 0,
  }

  let isConnected = true
  let address: string | undefined = FAKE_ZERODEV_ADDRESS

  return {
    projectId: FAKE_PROJECT_ID,
    isConnected,
    address,
    _callCounts: callCounts,

    sendUserOperation: async (_tx: any) => {
      callCounts.sendUserOperation++
      return {
        hash: FAKE_USER_OP_HASH,
        userOpHash: FAKE_USER_OP_HASH,
      }
    },

    async switchChain(chainId: number) {
      callCounts.switchChain++
      // Simulate chain switching
      console.log(`Switching to chain ${chainId}`)
    },

    // Test utilities
    _setConnected(connected: boolean) {
      isConnected = connected
    },

    _setAddress(newAddress: string | undefined) {
      address = newAddress
    },
  }
}

// Additional utilities for testing
export const createMockZeroDevContext = () => ({
  projectId: FAKE_PROJECT_ID,
  isConnected: true,
  address: FAKE_ZERODEV_ADDRESS,
  sendUserOperation: vi.fn().mockResolvedValue(FAKE_USER_OP_HASH),
  getAddress: vi.fn().mockResolvedValue(FAKE_ZERODEV_ADDRESS),
  signMessage: vi.fn().mockResolvedValue(FAKE_SIGNATURE),
  signTypedData: vi.fn().mockResolvedValue(FAKE_SIGNATURE),
  isLoading: false,
  error: null,
  connect: vi.fn().mockResolvedValue(undefined),
})
