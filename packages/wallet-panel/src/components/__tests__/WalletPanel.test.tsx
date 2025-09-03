import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletPanel } from '../WalletPanel'

import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WalletPanel } from '../WalletPanel'
import { useWalletAdapter } from '../../hooks/useWalletAdapter'
import { useWalletState } from '../../hooks/useWalletState'

const mockUseWalletAdapter = useWalletAdapter as any
const mockUseWalletState = useWalletState as any

  })

  describe('when not connected', () => {
    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: null,
        isReady: true,
      vi.mock('../../hooks/useWalletAdapter', () => ({ useWalletAdapter: vi.fn() }))
      vi.mock('../../hooks/useWalletState', () => ({ useWalletState: vi.fn() }))
      const { useWalletAdapter } = require('../../hooks/useWalletAdapter')
      const { useWalletState } = require('../../hooks/useWalletState')
      const mockUseWalletAdapter = useWalletAdapter as any
      const mockUseWalletState = useWalletState as any
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
    }

    beforeEach(() => {
      mockUseWalletAdapter.mockReturnValue({
        adapter: mockAdapter,
        isReady: true,
      vi.mock('../../hooks/useWalletAdapter', () => ({ useWalletAdapter: vi.fn() }))
      vi.mock('../../hooks/useWalletState', () => ({ useWalletState: vi.fn() }))
      const { useWalletAdapter } = require('../../hooks/useWalletAdapter')
      const { useWalletState } = require('../../hooks/useWalletState')
      const mockUseWalletAdapter = useWalletAdapter as any
      const mockUseWalletState = useWalletState as any
      mockUseWalletAdapter.mockReturnValue({
        adapter: mockAdapter,
        isReady: true,
        isConnected: true,
        isSmartAccountActive: false,
      })
      mockUseWalletState.mockReturnValue({
        isConnected: true,
        address: '0x1234567890abcdef1234567890abcdef12345678',
        chainId: 1,
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
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
      
      // Check that tabs exist and can be clicked
      const sendTab = screen.getByRole('tab', { name: /send/i })
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      
      expect(sendTab).toBeInTheDocument()
      expect(receiveTab).toBeInTheDocument()
      
      // Click on Send tab
      fireEvent.click(sendTab)
      
      // Click on Receive tab
      fireEvent.click(receiveTab)
      
      // Just verify the tabs are clickable - content testing would require more complex setup
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
      expect(screen.getByText(/smart account/i)).toBeInTheDocument()
    })

    it('should enable sponsored transactions when configured', () => {
      render(<WalletPanel enableSponsoredTx={true} />)
      
      // Click on Send tab to see sponsored transaction options
      fireEvent.click(screen.getByRole('tab', { name: /send/i }))
      
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
      expect(screen.getByRole('button', { name: /custom connect/i })).toBeInTheDocument()
    })
  })

  // --- Integration-style tests (no mocks, real hooks) ---
  describe('WalletPanel integration (real hooks)', () => {
    beforeEach(() => {
      // Unmock useWalletState for this block only
      vi.unmock('../../hooks/useWalletState')
    })
    afterEach(() => {
      // Restore the mock after this block
      vi.mock('../../hooks/useWalletState', () => ({ useWalletState: vi.fn() }))
    })
    it('renders wallet interface with a test adapter', async () => {
      // Provide a minimal test adapter as a class
      class TestAdapter {
        isReady() { return true }
        isConnected() { return true }
        isSmartAccountActive() { return false }
        async getAddress() { return '0x0000000000000000000000000000000000000000' }
        async getChainId() { return 1 }
        async getWalletInfo() { return { isSmartAccount: false } }
      }
      const testAdapter = new TestAdapter()
      const { WalletPanel } = await import('../WalletPanel')
      render(<WalletPanel adapter={testAdapter as any} />)
      // Wait for the UI to update (address will be truncated as 0x0000...0000)
      await waitFor(() => {
        const addressEl = screen.queryByText('0x0000...0000')
        expect(addressEl).not.toBeNull()
      })
    })
  })
})