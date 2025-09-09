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

The WalletPanel component supports two usage patterns:

### 1. Simple Configuration (Recommended for most users)
Just provide your Privy App ID and ZeroDev Project ID:

```tsx
import { PrivyProvider } from '@privy-io/react-auth'
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <WalletPanel
        config={{
          privyAppId: "your-privy-app-id",
          zerodevProjectId: "your-zerodev-project-id"
        }}
        enableSponsoredTx={true}
        showWalletConnect={true}
      />
    </PrivyProvider>
  )
}
```

### 2. Advanced Configuration (For complex integrations)
Provide pre-configured clients for full control:

```tsx
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <WalletPanel
      privyClient={privyClient}
      zerodev={zerodevContext}
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
      config={{
        privyAppId: "your-privy-app-id",
        zerodevProjectId: "your-zerodev-project-id"
      }}
      modalTitle="My Wallet"
    />
  )
}
```

## API Reference

### WalletPanelProps

```tsx
interface WalletPanelProps {
  // Advanced: Provide pre-configured clients (existing approach)
  privyClient?: PrivyClientLike
  zerodev?: ZeroDevContextLike
  wagmiConfig?: Config

  // Simple: Just provide configuration IDs (new approach)
  config?: SimpleWalletConfig

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

interface SimpleWalletConfig {
  // Simple configuration - just provide the IDs
  privyAppId?: string
  zerodevProjectId?: string
  
  // Optional: Custom RPC URLs (will use defaults if not provided)
  customRpcUrls?: {
    [chainId: number]: string
  }
  
  // Optional: WalletConnect project ID
  walletConnectProjectId?: string
  
  // Optional: Default chain (will use sepolia if not provided)
  defaultChainId?: number
}
```

### Components

#### WalletPanel
Main wallet component for inline display.

#### WalletTrigger
Button component that opens wallet in a modal overlay.

```tsx
interface WalletTriggerProps extends Omit<WalletPanelProps, 'className'> {
  trigger?: React.ReactNode     // Custom trigger button
  triggerClassName?: string     // Custom styling for trigger button
  modalTitle?: string           // Modal header title
}
```

#### WalletModal
Direct modal component for custom implementations.

```tsx
interface WalletModalProps extends Omit<WalletPanelProps, 'className'> {
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

### Simple Configuration (Recommended)

```tsx
import { PrivyProvider } from '@privy-io/react-auth'
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <WalletPanel
        config={{
          privyAppId: "your-privy-app-id",
          zerodevProjectId: "your-zerodev-project-id",
          // Optional: Custom chain configuration
          defaultChainId: 11155111, // Sepolia
          customRpcUrls: {
            11155111: "https://sepolia.gateway.tenderly.co"
          },
          // Optional: WalletConnect support
          walletConnectProjectId: "your-walletconnect-project-id"
        }}
        enableSponsoredTx={true}
        showWalletConnect={true}
        tokens={[
          { address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b', symbol: 'USDC', decimals: 6 }
        ]}
        onTxSubmitted={(hash) => console.log('Transaction:', hash)}
        onSign={(signature, message) => console.log('Signed:', { signature, message })}
      />
    </PrivyProvider>
  )
}
```

### Advanced Configuration (For Complex Integrations)

```tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WalletPanel } from '@wallet-panel/react'
import { useZeroDev } from './hooks/useZeroDev' // See apps/demo/src/hooks/useZeroDev.ts for implementation

function WalletComponent() {
  const privyClient = usePrivy()
  const zeroDevContext = useZeroDev()
  
  return (
    <WalletPanel
      privyClient={privyClient}
      zerodev={zeroDevContext}
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

### With ZeroDev Smart Accounts (SDK v5)

```tsx
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'
import { WalletPanel } from '@wallet-panel/react'
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk'
import { signerToEcdsaValidator } from '@zerodev/ecdsa-validator'
import { constants } from '@zerodev/sdk'
import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { useState, useEffect } from 'react'

function WalletComponent() {
  const privyClient = usePrivy()
  const [zerodevClient, setZerodevClient] = useState(null)

  useEffect(() => {
    if (privyClient.authenticated && privyClient.user?.wallet) {
      const initZeroDev = async () => {
        const provider = await privyClient.getEthereumProvider()
        
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http()
        })

        // Configure EntryPoint and Kernel version
        const entryPoint = constants.getEntryPoint('0.7')
        const kernelVersion = constants.KERNEL_V3_3

        // Create ZeroDev validator & account
        const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
          signer: provider,
          entryPoint,
          kernelVersion,
        })

        const account = await createKernelAccount(publicClient, {
          plugins: { sudo: ecdsaValidator },
          entryPoint,
          kernelVersion,
        })

        // Configure ZeroDev Paymaster client
        const paymaster = createZeroDevPaymasterClient({
          chain: sepolia,
          transport: http(process.env.VITE_ZERODEV_PAYMASTER_RPC),
        })

        // Create Kernel client
        const kernelClient = createKernelAccountClient({
          account,
          chain: sepolia,
          bundlerTransport: http(process.env.VITE_ZERODEV_BUNDLER_RPC),
          paymaster,
        })

        setZerodevClient({
          projectId: process.env.VITE_ZERODEV_PROJECT_ID,
          isConnected: true,
          address: account.address,
          sendUserOperation: async (tx) => {
            const hash = await kernelClient.sendUserOperation({
              ...tx,
              account: kernelClient.account,
            })
            return { hash, userOpHash: hash }
          },
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
<WalletPanel 
  config={{
    privyAppId: "your-privy-app-id",
    zerodevProjectId: "your-zerodev-project-id"
  }} 
/>

// Modal overlay (avoids UI conflicts)
<WalletTrigger 
  config={{
    privyAppId: "your-privy-app-id",
    zerodevProjectId: "your-zerodev-project-id"
  }}
  trigger={<button>Open Wallet</button>}
  modalTitle="My App Wallet"
/>

// Custom trigger styling
<WalletTrigger 
  config={{ privyAppId: "your-app-id" }}
  triggerClassName="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full"
  modalTitle="Custom Wallet"
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