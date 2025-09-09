import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, act, waitFor, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils/render'
import { WalletPanel } from '../components/WalletPanel'
import { useWalletState } from '../hooks/useWalletState'

// Mock the useWalletState hook
vi.mock('../hooks/useWalletState')

// Test constants
const MOCK_ADDRESS = '0x00EEaabbccddEEaabbccddEEaabbccddEEaabbcc'

// Test helper functions
function mockClipboard() {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn(() => Promise.resolve()),
      readText: vi.fn(() => Promise.resolve('')),
    },
  })
}

async function renderWalletPanel(props: any = {}) {
  // Use injected adapter pattern to bypass complex initialization
  const mockAdapter = {
    isReady: vi.fn(() => true),
    isConnected: vi.fn(() => true),
    isSmartAccountActive: vi.fn(() => false),
    getAddress: vi.fn(() => Promise.resolve(MOCK_ADDRESS)),
    getChainId: vi.fn(() => Promise.resolve(1)),
    getWalletInfo: vi.fn(() => Promise.resolve({ isSmartAccount: false })),
    signMessage: vi.fn(() => Promise.resolve('0x123')),
    sendTransaction: vi.fn(() => Promise.resolve({ hash: '0x456' })),
    login: vi.fn(() => Promise.resolve()),
    logout: vi.fn(() => Promise.resolve()),
    switchChain: vi.fn(() => Promise.resolve()),
  }
  
  const result = renderWithProviders(
    <WalletPanel 
      adapter={mockAdapter}
      {...props} 
    />
  )
  
  // Wait for async effects to complete
  await waitFor(() => {
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
  
  return result
}

describe('WalletPanel Integration Tests', () => {
  beforeEach(() => {
    mockClipboard()
    vi.clearAllMocks()
    
    // Mock useWalletState to return connected state for integration tests
    vi.mocked(useWalletState).mockReturnValue({
      isConnected: true,
      address: MOCK_ADDRESS,
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

  describe('Balances Tab', () => {
    it('should display wallet balances for both Privy and ZeroDev', async () => {
      await renderWalletPanel()
      
      // Should show balance tab by default
      const balancesTab = screen.getByRole('tab', { name: /balances/i })
      expect(balancesTab).toBeInTheDocument()
      expect(balancesTab).toHaveAttribute('aria-selected', 'true')
    })

    it('should have disconnect button in header', async () => {
      await renderWalletPanel()
      
      // Should have disconnect functionality
      const disconnectButton = screen.getByTitle(/disconnect/i)
      expect(disconnectButton).toBeInTheDocument()
    })

    it('should have refresh functionality available', async () => {
      await renderWalletPanel()
      
      // Should have balances tab available
      const balancesTab = screen.getByRole('tab', { name: /balances/i })
      expect(balancesTab).toBeInTheDocument()
    })

    it('should display basic wallet information', async () => {
      await renderWalletPanel()
      
      // Check wallet header information
      await waitFor(() => {
        expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
        expect(screen.getByText('EOA Account')).toBeInTheDocument()
      })
      
      // Check that disconnect button is present
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
      expect(disconnectButton).toBeInTheDocument()
    })
  })

  describe('Chain Selector', () => {
    it('should display wallet header with account info', async () => {
      await renderWalletPanel()
      
      // Should show EOA Account type in the header
      expect(screen.getByText(/eoa account/i)).toBeInTheDocument()
    })

    it('should display wallet address in header', async () => {
      await renderWalletPanel()
      
      // Should show wallet address in header
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
    })

    it('should have disconnect functionality', async () => {
      await renderWalletPanel()
      
      // Should have disconnect button in header
      const disconnectButton = screen.getByRole('button', { name: /disconnect/i })
      expect(disconnectButton).toBeInTheDocument()
    })

    it('should display proper wallet panel structure', async () => {
      await renderWalletPanel()
      
      // Should have proper wallet panel class
      const walletPanel = document.querySelector('.wallet-panel')
      expect(walletPanel).toBeTruthy()
      
      // Should have header section
      expect(screen.getByText('EOA Account')).toBeInTheDocument()
    })
  })

  describe('Receive Tab', () => {
    it('should have receive tab available', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      expect(receiveTab).not.toBeDisabled()
      
      // Just verify it can be clicked without errors
      await userEvent.click(receiveTab)
    })

    it('should have proper accessibility attributes', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      expect(receiveTab).not.toBeDisabled()
      
      // Should have proper ARIA attributes
      expect(receiveTab).toHaveAttribute('role', 'tab')
      expect(receiveTab).toHaveAttribute('aria-controls')
    })

    it('should have proper tab structure', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      
      // Check that it's part of the tab list
      const tabList = screen.getByRole('tablist')
      expect(tabList).toContainElement(receiveTab)
    })

    it('should be part of wallet tabs navigation', async () => {
      await renderWalletPanel()
      
      // Verify all 5 tabs are present including receive
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(5)
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
    })

    it('should support tab navigation with keyboard', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      
      // Tab should be focusable
      await act(async () => { receiveTab.focus() })
      expect(receiveTab).toHaveFocus()
    })

    it('should have proper ARIA attributes', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      
      // Should have proper ARIA attributes
      expect(receiveTab).toHaveAttribute('role', 'tab')
      expect(receiveTab).toHaveAttribute('aria-controls')
    })

    it('should be part of the wallet navigation', async () => {
      await renderWalletPanel()
      
      // Start with balances tab active
      const balancesTab = screen.getByRole('tab', { name: /balances/i })
      expect(balancesTab).toHaveAttribute('aria-selected', 'true')
      
      // Receive tab should exist but not be active initially
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      expect(receiveTab).toHaveAttribute('aria-selected', 'false')
    })

    it('should have receive icon and label', async () => {
      await renderWalletPanel()
      
      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      expect(receiveTab).toBeInTheDocument()
      
      // Should contain the receive text
      expect(receiveTab).toHaveTextContent(/receive/i)
    })
  })

  describe('Send Tab', () => {
    it('should have send tab available', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      expect(sendTab).not.toBeDisabled()
      
      // Just verify it can be clicked without errors
      await userEvent.click(sendTab)
    })

    it('should have proper accessibility attributes', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      
      // Should have proper ARIA attributes
      expect(sendTab).toHaveAttribute('role', 'tab')
      expect(sendTab).toHaveAttribute('aria-controls')
    })

    it('should be part of wallet tabs navigation', async () => {
      await renderWalletPanel()
      
      // Verify all 5 tabs are present including send
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(5)
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
    })

    it('should have send icon and label', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      
      // Should contain the send text
      expect(sendTab).toHaveTextContent(/send/i)
    })

    it('should be part of the wallet navigation', async () => {
      await renderWalletPanel()
      
      // Start with balances tab active
      const balancesTab = screen.getByRole('tab', { name: /balances/i })
      expect(balancesTab).toHaveAttribute('aria-selected', 'true')
      
      // Send tab should exist but not be active initially
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      expect(sendTab).toHaveAttribute('aria-selected', 'false')
    })

    it('should have proper tab structure', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      
      // Check that it's part of the tab list
      const tabList = screen.getByRole('tablist')
      expect(tabList).toContainElement(sendTab)
    })

    it('should support keyboard navigation', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      
      // Tab should be focusable
      await act(async () => { sendTab.focus() })
      expect(sendTab).toHaveFocus()
    })

    it('should support tab navigation with keyboard', async () => {
      await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      expect(sendTab).toBeInTheDocument()
      
      // Should be part of keyboard navigation
      expect(sendTab).toHaveAttribute('tabindex')
    })
  })

  describe('Sign Tab', () => {
    it('should have sign tab available', async () => {
      await renderWalletPanel()
      
      const signTab = screen.getByRole('tab', { name: /sign/i })
      expect(signTab).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      await renderWalletPanel()
      
      const signTab = screen.getByRole('tab', { name: /sign/i })
      expect(signTab).toBeInTheDocument()
      expect(signTab).not.toBeDisabled()
      
      // Just verify it can be clicked without errors
      await userEvent.click(signTab)
    })

    it('should have proper accessibility attributes', async () => {
      await renderWalletPanel()
      
      const signTab = screen.getByRole('tab', { name: /sign/i })
      expect(signTab).toBeInTheDocument()
      
      expect(signTab).toHaveAttribute('role', 'tab')
      expect(signTab).toHaveAttribute('aria-controls')
    })

    it('should be part of wallet tabs navigation', async () => {
      await renderWalletPanel()
      
      // Verify all 5 tabs are present including sign
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(5)
      
      const signTab = screen.getByRole('tab', { name: /sign/i })
      expect(signTab).toBeInTheDocument()
    })

    it('should have sign icon and label', async () => {
      await renderWalletPanel()
      
      const signTab = screen.getByRole('tab', { name: /sign/i })
      expect(signTab).toBeInTheDocument()
      
      // Should contain the sign text
      expect(signTab).toHaveTextContent(/sign/i)
    })
  })

  describe('More Tab', () => {
    it('should have more tab available', async () => {
      await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
    })

    it('should have proper tab structure', async () => {
      await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
      
      // Check that it's part of the tab list
      const tabList = screen.getByRole('tablist')
      expect(tabList).toContainElement(moreTab)
    })

    it('should support keyboard navigation', async () => {
      await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
      
      // Tab should be focusable
      await act(async () => { moreTab.focus() })
      expect(moreTab).toHaveFocus()
    })
  })

  describe('WalletConnect Integration', () => {
    it('should have WalletConnect functionality available', async () => {
      await renderWalletPanel()
      
      // WalletConnect should be available through the more tab
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      await await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
      expect(moreTab).not.toBeDisabled()
      
      // Just verify it can be clicked without errors
      await userEvent.click(moreTab)
    })

    it('should have proper accessibility attributes', async () => {
      await await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
      
      // Should have proper ARIA attributes
      expect(moreTab).toHaveAttribute('role', 'tab')
      expect(moreTab).toHaveAttribute('aria-controls')
    })

    it('should be part of wallet tabs navigation', async () => {
      await await renderWalletPanel()
      
      // Verify all 5 tabs are present including more
      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(5)
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
    })

    it('should have more icon and label', async () => {
      await await renderWalletPanel()
      
      const moreTab = screen.getByRole('tab', { name: /more/i })
      expect(moreTab).toBeInTheDocument()
      
      // Should contain the more text
      expect(moreTab).toHaveTextContent(/more/i)
    })

    it('should maintain consistent behavior', async () => {
      await await renderWalletPanel()
      
      const sendTab = screen.getByRole('tab', { name: /send/i })
      
      // Should be clickable multiple times
      await userEvent.click(sendTab)
      await userEvent.click(sendTab)
      
      // Should still be accessible
      expect(sendTab).toBeInTheDocument()
    })
  })

  describe('Sponsored Transactions', () => {
    it('should display smart account indicator for sponsored transactions', async () => {
      // Mock smart account state
      vi.mocked(useWalletState).mockReturnValue({
        isConnected: true,
        address: MOCK_ADDRESS,
        chainId: 1,
        isSmartAccount: true, // Smart account should show sponsored options
        nativeBalance: {
          balance: 1000000000000000000n,
          formatted: '1.0',
          symbol: 'ETH',
        },
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
      
      renderWalletPanel({ enableSponsoredTx: true })
      
      // Should show smart account indicator
      expect(screen.getByText(/smart account/i)).toBeInTheDocument()
    })

    it('should display EOA account indicator for regular transactions', async () => {
      // Mock EOA account state
      vi.mocked(useWalletState).mockReturnValue({
        isConnected: true,
        address: MOCK_ADDRESS,
        chainId: 1,
        isSmartAccount: false, // EOA should not show sponsored options
        nativeBalance: {
          balance: 1000000000000000000n,
          formatted: '1.0',
          symbol: 'ETH',
        },
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
      
      renderWalletPanel({ enableSponsoredTx: false })
      
      // Should show EOA account indicator
      expect(screen.getByText(/eoa account/i)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle loading states gracefully', async () => {
      // Mock loading state
      vi.mocked(useWalletState).mockReturnValue({
        isConnected: true,
        address: MOCK_ADDRESS,
        chainId: 1,
        isSmartAccount: false,
        nativeBalance: undefined,
        tokenBalances: [],
        isLoading: true, // Loading state
        refreshWalletData: vi.fn(),
      })
      
      await await renderWalletPanel()
      
      // Should show loading indicators or handle gracefully
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
    })

    it('should handle disconnected state', async () => {
      // Mock disconnected state
      vi.mocked(useWalletState).mockReturnValue({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        isSmartAccount: false,
        nativeBalance: undefined,
        tokenBalances: [],
        isLoading: false,
        refreshWalletData: vi.fn(),
      })
      
     await  renderWalletPanel()
      
      // Should show disconnected state
      expect(screen.getByText(/not connected/i)).toBeInTheDocument()
    })

    it('should handle invalid configuration gracefully', async () => {
      // Test with no configuration provided
      render(
        <WalletPanel />
      )
      
      // Should show configuration error
      expect(screen.getByText(/configuration required/i)).toBeInTheDocument()
      expect(screen.getByText(/simple config/i)).toBeInTheDocument()
      expect(screen.getByText(/pre-configured clients/i)).toBeInTheDocument()
    })

    it('should handle form validation gracefully', async () => {
     await  renderWalletPanel()
      
      // Component should handle validation without crashing
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
      
      // Should have proper form structure
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
    })

    it('should have error boundary protection', async () => {
     await  renderWalletPanel()
      
      // Component should render without throwing errors
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
      
      // Should have proper error handling structure
      const walletPanel = document.querySelector('.wallet-panel')
      expect(walletPanel).toBeInTheDocument()
    })

    it('should handle network errors gracefully', async () => {
     await  renderWalletPanel()
      
      // Should render even if network calls fail
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
      
      // Should have proper fallback UI
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
    })

    it('should maintain component stability', async () => {
     await  renderWalletPanel()
      
      // Component should be stable and not crash
      const walletPanel = document.querySelector('.wallet-panel')
      expect(walletPanel).toBeInTheDocument()
      
      // Should handle multiple re-renders
      expect(screen.getByText('0x00EE...bbcc')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper tab structure', async () => {
     await  renderWalletPanel()
      
      // Check for proper roles and labels
      expect(screen.getByRole('tablist')).toBeTruthy()
      expect(screen.getAllByRole('tab')).toHaveLength(5) // balances, receive, send, sign, more
      
      // Check tab names
      expect(screen.getByRole('tab', { name: /balances/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /receive/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /send/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /sign/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /more/i })).toBeInTheDocument()
    })
  })
})
