import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { WalletPanelProps } from '../types'
import { WalletPanel } from '../components/WalletPanel'
import { vi } from 'vitest'

// Create a test-specific QueryClient with no retries and short cache times
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Test wrapper component
function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Simple mock adapters for testing
function createMockPrivyClient() {
  return {
    user: { wallet: { address: '0x00EEaabbccddEEaabbccddEEaabbccddEEaabbcc' } },
    authenticated: true,
    ready: true,
    login: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
    getEthereumProvider: vi.fn(() => ({
      request: vi.fn(() => Promise.resolve('0x1bc16d674ec80000'))
    }))
  }
}

function createMockZeroDevContext() {
  return {
    projectId: 'test-project-id',
    isConnected: true,
    address: '0x00EEaabbccddEEaabbccddEEaabbccddEEaabbcc',
    sendUserOperation: vi.fn(() => Promise.resolve({
      hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      userOpHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    })),
    switchChain: vi.fn(() => Promise.resolve())
  }
}

/**
 * Renders a component with all necessary providers for testing
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions = {}
) {
  // Mock clipboard for tests
  const mockClipboard = {
    writeText: vi.fn(() => Promise.resolve()),
  }
  Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders>{children}</TestProviders>
  )

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    mockClipboard,
  }
}

/**
 * Renders WalletPanel with mock adapters for testing
 */
export function renderWalletPanel(props: Partial<WalletPanelProps> = {}) {
  const mockPrivy = createMockPrivyClient()
  const mockZerodev = createMockZeroDevContext()

  return renderWithProviders(
    <WalletPanel 
      privyClient={mockPrivy}
      zerodev={mockZerodev}
      {...props}
    />
  )
}

// Helper function to mock clipboard
export function mockClipboard() {
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    writable: true,
  })
  return { writeText }
}
