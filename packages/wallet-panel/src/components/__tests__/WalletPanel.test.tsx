import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletPanel } from '../WalletPanel'
import { mockPrivyClient, mockZeroDevContext, mockDisconnectedPrivyClient } from '../../test/mocks'

// Mock the hooks
vi.mock('../../hooks/useWalletAdapter', () => ({
  useWalletAdapter: vi.fn(),
}))

vi.mock('../../hooks/useWalletState', () => ({
  useWalletState: vi.fn(),
}))

import { useWalletAdapter } from '../../hooks/useWalletAdapter'
import { useWalletState } from '../../hooks/useWalletState'

const mockUseWalletAdapter = useWalletAdapter as any
const mockUseWalletState = useWalletState as any

describe('WalletPanel', () => {
  beforeEach(() => {
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

    it('should render connect prompt', () => {
      render(<WalletPanel />)
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })

    it('should call onRequestLogin when connect button is clicked', () => {
      const onRequestLogin = vi.fn()
      render(<WalletPanel onRequestLogin={onRequestLogin} />)
      
      fireEvent.click(screen.getByText('Connect Wallet'))
      expect(onRequestLogin).toHaveBeenCalled()
    })
  })

  describe('when connected', () => {
    const mockAdapter = {
      switchChain: vi.fn(),
    }

    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: mockAdapter,
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
      expect(screen.getByText('Balances')).toBeInTheDocument()
      expect(screen.getByText('1.0')).toBeInTheDocument()
    })

    it('should switch between tabs', async () => {
      render(<WalletPanel />)
      
      // Click on Send tab
      fireEvent.click(screen.getByText('Send'))
      await waitFor(() => {
        expect(screen.getByText('Send Assets')).toBeInTheDocument()
      })
      
      // Click on Receive tab
      fireEvent.click(screen.getByText('Receive'))
      await waitFor(() => {
        expect(screen.getByText('Receive Assets')).toBeInTheDocument()
      })
    })

    it('should handle chain switching', async () => {
      const chains = [
        { id: 1, name: 'Ethereum' },
        { id: 137, name: 'Polygon' },
      ]
      
      render(<WalletPanel chains={chains} showChainSelector={true} />)
      
      // This would test chain selector interaction
      // Implementation depends on the actual UI structure
    })
  })

  describe('with smart account', () => {
    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: {},
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
      expect(screen.getByText('Smart Account')).toBeInTheDocument()
    })

    it('should enable sponsored transactions when configured', () => {
      render(<WalletPanel enableSponsoredTx={true} />)
      
      // Click on Send tab to see sponsored transaction options
      fireEvent.click(screen.getByText('Send'))
      
      // This would test for sponsored transaction UI elements
      // Implementation depends on the actual UI structure
    })
  })

  describe('callbacks', () => {
    const mockCallbacks = {
      onTxSubmitted: vi.fn(),
      onTxConfirmed: vi.fn(),
      onSign: vi.fn(),
      onRequestExport: vi.fn(),
    }

    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: {},
        isReady: true,
        isConnected: true,
        isSmartAccountActive: false,
      })

      mockUseWalletState.mockReturnValue({
        isConnected: true,
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        chainId: 1,
        isSmartAccount: false,
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
    })

    it('should pass callbacks to child components', () => {
      render(<WalletPanel {...mockCallbacks} />)
      
      // This would test that callbacks are properly passed down
      // Implementation depends on how callbacks are used in child components
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
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })

      render(<WalletPanel localeStrings={customStrings} />)
      expect(screen.getByText('Custom Connect')).toBeInTheDocument()
    })
  })
})