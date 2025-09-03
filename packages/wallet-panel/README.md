# @wallet-panel/react

A production-ready React wallet component that provides essential wallet functionality while abstracting over Privy and ZeroDev.

## Installation

```bash
npm install @wallet-panel/react
```

### Peer Dependencies

```bash
npm install react react-dom @privy-io/react-auth @zerodev/waas wagmi viem
```

Optional peer dependencies:
```bash
npm install @walletconnect/modal  # For WalletConnect support
```

## Quick Start

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
  localeStrings?: Record<string, string>
  className?: string
}
```

### Types

```tsx
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
import { PrivyProvider } from '@privy-io/react-auth'
import { ZeroDevProvider } from '@zerodev/waas'
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <PrivyProvider appId="your-privy-app-id">
      <ZeroDevProvider projectId="your-zerodev-project-id">
        <WalletPanel
          enableSponsoredTx
          showWalletConnect
          tokens={[
            { address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b', symbol: 'USDC', decimals: 6 }
          ]}
          onRequestLogin={() => openPrivyLogin()}
        />
      </ZeroDevProvider>
    </PrivyProvider>
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
]

<WalletPanel
  chains={chains}
  showChainSelector={true}
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