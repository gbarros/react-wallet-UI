# @wallet-panel/react

A production-ready React wallet component that provides essential wallet functionality while abstracting over Privy and ZeroDev.

## Installation

```bash
npm install @wallet-panel/react
```

### Peer Dependencies

```bash
npm install react react-dom @privy-io/react-auth @zerodev/sdk wagmi viem
```

Optional peer dependencies:
```bash
npm install @walletconnect/modal  # For WalletConnect support
```

## Quick Start

### Inline Panel
```tsx
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <WalletPanel
      privyClient={privyClient}
      onRequestLogin={() => openPrivyLogin()}
    />
  )
}
```

### Modal Overlay
```tsx
import { WalletTrigger } from '@wallet-panel/react'

function App() {
  return (
    <WalletTrigger
      privyClient={privyClient}
      modalTitle="My Wallet"
      onRequestLogin={() => openPrivyLogin()}
    />
  )
}
```

## API Reference

### WalletPanelProps

```tsx
interface WalletPanelProps {
  // Providers
  privyClient?: PrivyClientLike
  zerodev?: ZeroDevContextLike
  wagmiConfig?: Config

  // UI/UX toggles
  showChainSelector?: boolean
  showWalletConnect?: boolean
  defaultCollapsed?: boolean

  // Assets and chains
  chains?: ChainConfig[]
  tokens?: Erc20[]

  // Sponsored transactions
  enableSponsoredTx?: boolean

  // Callbacks
  onRequestLogin?: () => void
  onTxSubmitted?: (hashOrUserOp: string) => void
  onTxConfirmed?: (receipt: unknown) => void
  onSign?: (sig: string, message: string) => void
  onRequestExport?: () => void

  // i18n
  localeStrings?: Partial<LocaleStrings>
  className?: string
  
  // For testing/integration
  adapter?: any
}
```

### Components

#### WalletPanel
Main wallet component for inline display.

#### WalletTrigger
Button component that opens wallet in a modal overlay.

```tsx
interface WalletTriggerProps extends WalletPanelProps {
  trigger?: React.ReactNode  // Custom trigger button
  modalTitle?: string        // Modal header title
}
```

#### WalletModal
Direct modal component for custom implementations.

```tsx
interface WalletModalProps extends WalletPanelProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}
```

### Types

```tsx
// Re-exported from viem to avoid conflicts
export type { Address, Hex, Hash, TransactionRequest } from 'viem'

type ChainConfig = {
  id: number
  rpcUrl?: string
  name?: string
  logoUrl?: string
}

type Erc20 = {
  address: Address
  symbol: string
  decimals: number
  logoUrl?: string
}
```

## Examples

### Privy + ZeroDev Integration

```tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WalletPanel, WalletTrigger } from '@wallet-panel/react'

function WalletComponent() {
  const privyClient = usePrivy()
  
  return (
    <WalletPanel
      privyClient={privyClient}
      enableSponsoredTx
      showWalletConnect
      tokens={[
        { address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b', symbol: 'USDC', decimals: 6 }
      ]}
      onRequestLogin={() => privyClient.login()}
    />
  )
}

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <WalletComponent />
    </PrivyProvider>
  )
}
```

### With ZeroDev Smart Accounts

```tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WalletPanel } from '@wallet-panel/react'
import { createKernelAccount, createKernelAccountClient, createEcdsaKernelSmartAccount } from '@zerodev/sdk'
import { ENTRYPOINT_ADDRESS_V07 } from 'permissionless'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { useState, useEffect } from 'react'

function WalletComponent() {
  const privyClient = usePrivy()
  const [zerodevClient, setZerodevClient] = useState(null)

  useEffect(() => {
    if (privyClient.authenticated && privyClient.user?.wallet) {
      const initZeroDev = async () => {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })

        const ecdsaAccount = await createEcdsaKernelSmartAccount(publicClient, {
          entryPoint: ENTRYPOINT_ADDRESS_V07,
          signer: privyClient.getEthereumProvider()
        })

        const account = await createKernelAccount(publicClient, {
          plugins: {
            sudo: ecdsaAccount
          }
        })

        const kernelClient = createKernelAccountClient({
          account,
          chain: sepolia,
          bundlerTransport: http(process.env.VITE_ZERODEV_BUNDLER_RPC),
          middleware: {
            sponsorUserOperation: async ({ userOperation }) => {
              // Add paymaster sponsorship logic
              return userOperation
            }
          }
        })

        setZerodevClient({
          isConnected: true,
          address: account.address,
          sendUserOperation: kernelClient.sendUserOperation,
          switchChain: async (chainId) => {
            // Implement chain switching logic
          }
        })
      }

      initZeroDev().catch(console.error)
    }
  }, [privyClient.authenticated, privyClient.user])
  
  return (
    <WalletPanel
      privyClient={privyClient}
      zerodev={zerodevClient}
      enableSponsoredTx
      onRequestLogin={() => privyClient.login()}
    />
  )
}
```

### Custom Styling

```tsx
<WalletPanel
  className="custom-wallet-panel"
  localeStrings={{
    connect: 'Connect Your Wallet',
    send: 'Transfer Assets',
    receive: 'Receive Funds',
  }}
/>
```

### Chain Configuration

```tsx
const chains = [
  { id: 1, name: 'Ethereum', logoUrl: '/ethereum-logo.png' },
  { id: 137, name: 'Polygon', logoUrl: '/polygon-logo.png' },
  { id: 8453, name: 'Base', logoUrl: '/base-logo.png' },
  { id: 11155111, name: 'Sepolia', rpcUrl: 'https://sepolia.gateway.tenderly.co' },
]

<WalletPanel
  chains={chains}
  showChainSelector={true}
/>
```

### Modal vs Inline Display

```tsx
// Inline panel (embedded in your UI)
<WalletPanel privyClient={privy} zerodev={zerodev} />

// Modal overlay (avoids UI conflicts)
<WalletTrigger 
  privyClient={privy} 
  zerodev={zerodev}
  trigger={<button>Open Wallet</button>}
  modalTitle="My App Wallet"
/>
```

## Features

### Balance Management
- View native token balances
- Display ERC-20 token balances
- Real-time balance updates
- Token logo support

### Transaction Handling
- Send native tokens and ERC-20s
- Gas estimation and configuration
- Sponsored transactions (gasless) with ZeroDev
- Transaction status tracking

### Message Signing
- Sign arbitrary text messages
- Signature verification
- Copy signature to clipboard

### WalletConnect Integration
- Connect to external dApps
- QR code scanning
- Session management
- Disconnect functionality

### Smart Account Features
- Account abstraction with ZeroDev
- Sponsored transaction toggle
- Smart account vs EOA switching
- Owner and nonce information

## Styling

The component uses Tailwind CSS with CSS custom properties for theming:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... other variables */
}
```

You can override these variables to customize the appearance.

## Security Considerations

- The component never handles private keys directly
- All cryptographic operations are delegated to providers
- Use `onRequestExport` callback for secure key management flows
- Input validation is performed on all user inputs

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT