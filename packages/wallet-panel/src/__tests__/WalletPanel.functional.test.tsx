/**
 * Functional tests for WalletPanel: real validation and workflows
 */
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletPanel } from '../components/WalletPanel'
import { renderWithProviders } from '../test-utils/render'
import { useWalletState } from '../hooks/useWalletState'

// Ensure QR generation is stubbed
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqrcode'),
}))

const MOCK_ADDRESS = '0x00EEaabbccddEEaabbccddEEaabbccddEEaabbcc' as const

// Minimal connected state helper
function mockConnectedWalletState(overrides: Partial<ReturnType<typeof useWalletState>> = {}) {
  vi.mocked(useWalletState).mockReturnValue({
    isConnected: true,
    address: MOCK_ADDRESS,
    chainId: 1,
    isSmartAccount: false,
    nativeBalance: { balance: 1000000000000000000n, formatted: '1.0', symbol: 'ETH' },
    tokenBalances: [],
    isLoading: false,
    refreshWalletData: vi.fn(),
    ...overrides,
  } as any)
}

// Mock adapter with required methods
const mockAdapter = {
  isReady: vi.fn(() => true),
  isConnected: vi.fn(() => true),
  isSmartAccountActive: vi.fn(() => false),
  getAddress: vi.fn(async () => MOCK_ADDRESS),
  getChainId: vi.fn(async () => 1),
  getWalletInfo: vi.fn(async () => ({ isSmartAccount: false })),
  signMessage: vi.fn(async () => '0x123'),
  sendTransaction: vi.fn(async () => ({ hash: '0x456' })),
  login: vi.fn(async () => {}),
  logout: vi.fn(async () => {}),
  switchChain: vi.fn(async () => {}),
}

describe('WalletPanel Functional Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Enable secure clipboard path
    Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
  })

  describe('Send Tab - Validation and Submission', () => {
    it('validates recipient and amount and enables submit when valid', async () => {
      mockConnectedWalletState()
      const onTxSubmitted = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <WalletPanel adapter={mockAdapter as any} onTxSubmitted={onTxSubmitted} />
      )

      // Go to Send tab
      const sendTab = screen.getByRole('tab', { name: /send/i })
      await user.click(sendTab)

      // Initially shows recipient required error, submit disabled
      await waitFor(() => {
        expect(screen.getByText('Recipient address is required')).toBeInTheDocument()
      })
      const recipientInput = screen.getByPlaceholderText('0x... or name.eth') as HTMLInputElement
      const amountInput = screen.getByPlaceholderText('0.0') as HTMLInputElement
      const submitBtn = screen.getByRole('button', { name: /send/i })
      expect(submitBtn).toBeDisabled()

      // Invalid recipient
      await user.type(recipientInput, 'invalid')
      await waitFor(() => {
        expect(screen.getByText('Invalid recipient address')).toBeInTheDocument()
      })

      // Valid recipient, now amount required
      await user.clear(recipientInput)
      await user.type(recipientInput, '0x' + '1'.repeat(40))
      await waitFor(() => {
        expect(screen.getByText('Amount is required')).toBeInTheDocument()
      })

      // Invalid amount
      await user.type(amountInput, '0')
      await waitFor(() => {
        expect(screen.getByText('Invalid amount')).toBeInTheDocument()
      })

      // Valid amount within balance; submit enabled and triggers send
      await user.clear(amountInput)
      await user.type(amountInput, '0.1')
      await waitFor(() => expect(submitBtn).toBeEnabled())

      await user.click(submitBtn)
      await waitFor(() => {
        expect(mockAdapter.sendTransaction).toHaveBeenCalled()
        expect(onTxSubmitted).toHaveBeenCalledWith('0x456')
      })
    })

    it('sends ERC-20 transfer with correct calldata', async () => {
      // Prepare wallet state with an ERC-20 balance
      const token = {
        address: '0x' + '2'.repeat(40) as const,
        symbol: 'USDC',
        decimals: 6,
      }
      mockConnectedWalletState({
        tokenBalances: [
          {
            token,
            balance: 1_000_000n, // 1.0 USDC
            formatted: '1.0',
          },
        ],
        nativeBalance: undefined,
      } as any)

      const onTxSubmitted = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <WalletPanel adapter={mockAdapter as any} onTxSubmitted={onTxSubmitted} tokens={[token as any]} />
      )

      // Go to Send tab
      const sendTab = screen.getByRole('tab', { name: /send/i })
      await user.click(sendTab)

      // Asset defaults to USDC when no native balance is available

      // Enter recipient and amount (0.5 USDC -> 500000 base units)
      const recipientInput = screen.getByPlaceholderText('0x... or name.eth') as HTMLInputElement
      const amountInput = screen.getByPlaceholderText('0.0') as HTMLInputElement
      await user.type(recipientInput, '0x' + '1'.repeat(40))
      await user.type(amountInput, '0.5')

      // Submit
      const submitBtn = screen.getByRole('button', { name: /^send$/i })
      await user.click(submitBtn)

      await waitFor(() => {
        expect(mockAdapter.sendTransaction).toHaveBeenCalled()
      })

      // Validate calldata encoding: 0xa9059cbb + 32-byte addr + 32-byte amount
      const call = vi.mocked(mockAdapter.sendTransaction).mock.calls.at(-1)![0] as any
      expect(call.to).toBe(token.address)
      expect(call.data).toMatch(/^0xa9059cbb[0-9a-fA-F]{128}$/)

      // Verify encoded recipient and amount appear in calldata
      const encoded = call.data as string
      const encodedTo = encoded.slice(10, 74)
      const encodedAmount = encoded.slice(74)
      expect(encodedTo.endsWith('1'.repeat(40))).toBe(true)
      // 0.5 USDC with 6 decimals equals 500000 -> 0x7a120
      expect(BigInt('0x' + encodedAmount)).toBe(500000n)

      expect(onTxSubmitted).toHaveBeenCalledWith('0x456')
    })
  })

  describe('Sign Tab - Message Signing', () => {
    it('signs a message and shows signature, copy works', async () => {
      mockConnectedWalletState()
      const onSign = vi.fn()
      const user = userEvent.setup()

      renderWithProviders(
        <WalletPanel adapter={mockAdapter as any} onSign={onSign} />
      )

      const signTab = screen.getByRole('tab', { name: /sign/i })
      await user.click(signTab)

      const textarea = screen.getByPlaceholderText('Enter message to sign...')
      await user.type(textarea, 'hello')

      const signButton = screen.getByRole('button', { name: /^sign$/i })
      await user.click(signButton)

      await waitFor(() => {
        expect(mockAdapter.signMessage).toHaveBeenCalledWith('hello')
        expect(onSign).toHaveBeenCalledWith('0x123', 'hello')
        expect(screen.getByDisplayValue('0x123')).toBeInTheDocument()
      })

      // Copy signature
      const sigInput = screen.getByDisplayValue('0x123')
      const copyBtn = within(sigInput.parentElement as HTMLElement).getByRole('button')
      await user.click(copyBtn)
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })
  })

  describe('Receive Tab - QR and Copy', () => {
    it('generates QR code and copies address', async () => {
      mockConnectedWalletState()
      const user = userEvent.setup()

      renderWithProviders(
        <WalletPanel adapter={mockAdapter as any} />
      )

      const receiveTab = screen.getByRole('tab', { name: /receive/i })
      await user.click(receiveTab)

      // QR image should appear
      await waitFor(() => {
        expect(screen.getByAltText('Address QR Code')).toBeInTheDocument()
      })

      // Copy address
      const addrInput = screen.getByDisplayValue(MOCK_ADDRESS)
      const copyButton = within(addrInput.parentElement as HTMLElement).getByRole('button')
      await user.click(copyButton)
      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument()
      })
    })
  })
})
