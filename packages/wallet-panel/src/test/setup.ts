import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Make vi globally available
globalThis.vi = vi

// Mock @walletconnect/modal
vi.mock('@walletconnect/modal', () => ({
  // Export a default no-op class to satisfy potential consumers
  default: class WalletConnectModal {},
}))

// Mock @privy-io/react-auth
vi.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children }: { children: React.ReactNode }) => children,
  usePrivy: () => ({
    ready: true,
    authenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  useWallets: () => ({
    wallets: [],
    ready: true,
  }),
  useLogin: () => ({
    login: vi.fn(),
  }),
  useLogout: () => ({
    logout: vi.fn(),
  }),
}))

// Mock @zerodev/sdk
vi.mock('@zerodev/sdk', () => ({
  createKernelAccount: vi.fn(),
  createKernelAccountClient: vi.fn(),
}))

// Mock viem to prevent real HTTP calls and background handles
vi.mock('viem', () => ({
  createPublicClient: vi.fn(() => ({
    getBalance: vi.fn(() => Promise.resolve(0n)),
    getChainId: vi.fn(() => Promise.resolve(1)),
    readContract: vi.fn(() => Promise.resolve(0n)),
    multicall: vi.fn(() => Promise.resolve([])),
    transport: { url: 'mock://localhost' },
    chain: { id: 1, name: 'Ethereum' },
  })),
  createWalletClient: vi.fn(() => ({
    account: '0x0000000000000000000000000000000000000000',
    chain: { id: 1, name: 'Ethereum' },
    transport: { url: 'mock://localhost' },
    sendTransaction: vi.fn(() => Promise.resolve({ hash: '0x123' })),
    signMessage: vi.fn(() => Promise.resolve('0x456')),
  })),
  http: vi.fn(() => ({ url: 'mock://localhost' })),
  formatEther: vi.fn((value) => (Number(value) / 1e18).toString()),
  parseEther: vi.fn((value) => BigInt(Math.floor(parseFloat(value) * 1e18))),
  isAddress: vi.fn(() => true),
  getAddress: vi.fn((addr) => addr),
  EIP1193Provider: class MockEIP1193Provider {},
  mainnet: { id: 1, name: 'Ethereum Mainnet' },
  sepolia: { id: 11155111, name: 'Sepolia' },
}))

// Mock useWalletState hook to prevent network calls in tests
vi.mock('../hooks/useWalletState', () => ({
  useWalletState: vi.fn(() => ({
    isConnected: false,
    address: undefined,
    chainId: undefined,
    isSmartAccount: false,
    nativeBalance: undefined,
    tokenBalances: [],
    isLoading: false,
    refreshWalletData: vi.fn(),
  })),
}))

// Mock qrcode dynamic import; provide a lightweight mock to avoid any timers
vi.mock('qrcode', () => ({
  toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,AAAA')),
}))

// Cleanup after each test case with aggressive cleanup
afterEach(async () => {
  // Clear all mocks
  vi.clearAllMocks()
  // Cleanup DOM
  cleanup()
})

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Stub window.open to avoid creating real browser windows in tests
Object.defineProperty(window, 'open', {
  writable: true,
  value: vi.fn(),
})

// jsdom doesn't implement Pointer Events APIs used by Radix UI
// Provide minimal shims to prevent runtime errors in tests
// @ts-expect-error - augmenting Element prototype for test env
if (!Element.prototype.hasPointerCapture) {
  // @ts-expect-error - jsdom env
  Element.prototype.hasPointerCapture = () => false
}
// @ts-expect-error - augmenting Element prototype for test env
if (!Element.prototype.setPointerCapture) {
  // @ts-expect-error - jsdom env
  Element.prototype.setPointerCapture = () => {}
}
// @ts-expect-error - augmenting Element prototype for test env
if (!Element.prototype.releasePointerCapture) {
  // @ts-expect-error - jsdom env
  Element.prototype.releasePointerCapture = () => {}
}
