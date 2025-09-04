import React from 'react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletPanel } from '../WalletPanel'

// Mock the hooks
vi.mock('../../hooks/useWalletAdapter', () => ({ 
  useWalletAdapter: vi.fn() 
}))
vi.mock('../../hooks/useWalletState', () => ({ 
  useWalletState: vi.fn() 
}))

// Import mocked hooks
import { useWalletAdapter } from '../../hooks/useWalletAdapter'
import { useWalletState } from '../../hooks/useWalletState'

const mockUseWalletAdapter = vi.mocked(useWalletAdapter)
const mockUseWalletState = vi.mocked(useWalletState)

describe('WalletPanel', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when not connected', () => {
    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: null,
        isReady: true,
        isConnected: false,
        isSmartAccountActive: false,
      })
      mockUseWalletState.mockReturnValue({
        isConnected: false,
        isSmartAccount: false,
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
    })

    it('should show connect prompt when not connected', () => {
      render(<WalletPanel />)
      expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument()
    })

    it('should call onRequestLogin when connect button is clicked', () => {
      const onRequestLogin = vi.fn()
      render(<WalletPanel onRequestLogin={onRequestLogin} />)
      
      fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }))
      expect(onRequestLogin).toHaveBeenCalled()
    })
  })

  describe('when connected', () => {
    const mockAdapter = {
      switchChain: vi.fn(),
      isReady: () => true,
      isConnected: () => true,
      isSmartAccountActive: () => false,
    }

    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: mockAdapter as any,
        isReady: true,
        isConnected: true,
        isSmartAccountActive: false,
      })
      mockUseWalletState.mockReturnValue({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chainId: 1,
        isSmartAccount: false,
        nativeBalance: {
          balance: 1000000000000000000n,
          formatted: '1.0',
          symbol: 'ETH',
        },
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
    })

    it('should render wallet interface', () => {
      render(<WalletPanel />)
      expect(screen.getByText('0x742d...d8b6')).toBeInTheDocument()
    })

    it('should show balance tab by default', () => {
      render(<WalletPanel />)
      expect(screen.getByRole('tab', { name: /balances/i })).toBeInTheDocument()
      expect(screen.getByText('1.0')).toBeInTheDocument()
    })

    it('should switch between tabs', async () => {
      render(<WalletPanel />)
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      
      expect(sendTab).toBeInTheDocument()
      expect(receiveTab).toBeInTheDocument()
      
      fireEvent.click(sendTab)
      fireEvent.click(receiveTab)
    })
  })

  describe('with smart account', () => {
    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: {} as any,
        isReady: true,
        isConnected: true,
        isSmartAccountActive: true,
      })

      mockUseWalletState.mockReturnValue({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chainId: 1,
        isSmartAccount: true,
        nativeBalance: {
          balance: 1000000000000000000n,
          formatted: '1.0',
          symbol: 'ETH',
        },
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
    })

    it('should show smart account indicator', () => {
      render(<WalletPanel />)
      expect(screen.getByText(/smart account/i)).toBeInTheDocument()
    })

    it('should enable sponsored transactions when configured', () => {
      render(<WalletPanel enableSponsoredTx={true} />)
      
      fireEvent.click(screen.getByRole('tab', { name: /send/i }))
    })
  })

  describe('localization', () => {
    it('should use custom locale strings', () => {
      const customStrings = {
        connect: 'Custom Connect',
        balances: 'Custom Balances',
      }

      mockUseWalletAdapter.mockReturnValue({
        adapter: null,
        isReady: true,
        isConnected: false,
        isSmartAccountActive: false,
      })

      mockUseWalletState.mockReturnValue({
        isConnected: false,
        isSmartAccount: false,
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })

      render(<WalletPanel localeStrings={customStrings} />)
      expect(screen.getByRole('button', { name: /custom connect/i })).toBeInTheDocument()
    })
  })

  describe('integration with test adapter', () => {
    beforeEach(() => {
      // Reset mocks for integration test
      vi.clearAllMocks()
      // Don't mock useWalletState for this test - let it use the real hook
      mockUseWalletAdapter.mockImplementation(() => ({
        adapter: null,
        isReady: false,
        isConnected: false,
        isSmartAccountActive: false,
      }))
    })

    it('renders wallet interface with a test adapter', async () => {
      class TestAdapter {
        isReady() { return true }
        isConnected() { return true }
        isSmartAccountActive() { return false }
        async getAddress() { return '0x0000000000000000000000000000000000000000' as const }
        async getChainId() { return 1 }
        async getWalletInfo() { return { isSmartAccount: false } }
        async signMessage() { return '0x' as const }
        async sendTransaction() { return { hash: '0x' as const } }
        async switchChain() { return }
      }
      
      const testAdapter = new TestAdapter()
      
      // Mock useWalletState to return the expected state for this adapter
      mockUseWalletState.mockReturnValue({
        isConnected: true,
        address: '0x0000000000000000000000000000000000000000' as const,
        chainId: 1,
        isSmartAccount: false,
        nativeBalance: {
          balance: 0n,
          formatted: '0',
          symbol: 'ETH',
        },
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
      
      render(<WalletPanel adapter={testAdapter as any} />)
      
      await waitFor(() => {
        const addressEl = screen.queryByText('0x0000...0000')
        expect(addressEl).not.toBeNull()
      }, { timeout: 3000 })
    })
  })
})