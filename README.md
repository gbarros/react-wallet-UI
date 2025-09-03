# React Wallet Panel

A production-ready, drop-in React/TypeScript wallet component that provides essential wallet functionality while abstracting over Privy (auth + embedded wallet) and ZeroDev (AA smart account). Designed to feel like a plug-in with minimal setup, optional features, and safe defaults.

## Features

- 🔐 **Multi-provider support**: Works with Privy, ZeroDev, or both
- 💰 **Balance management**: View native and ERC-20 token balances
- 📤 **Send transactions**: Support for both regular and sponsored (gasless) transactions
- 📥 **Receive assets**: QR code generation and address sharing
- ✍️ **Message signing**: Sign arbitrary messages for authentication
- 🔗 **WalletConnect**: Connect to external dApps
- 🎛️ **Smart account features**: Account abstraction with ZeroDev integration
- 🌐 **Multi-chain**: Chain switching and configuration
- 🎨 **Customizable**: Tailwind CSS styling with shadcn/ui components
- ♿ **Accessible**: Built with accessibility in mind
- 🌍 **i18n ready**: Customizable locale strings

## Quick Start

### Installation

```bash
npm install @wallet-panel/react
```

### Peer Dependencies

```bash
npm install react react-dom @privy-io/react-auth @zerodev/waas wagmi viem
```

### Basic Usage

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

### With ZeroDev (Smart Accounts)

```tsx
import { WalletPanel } from '@wallet-panel/react'

function App() {
  return (
    <WalletPanel
      privyClient={privyClient}
      zerodev={zerodevContext}
      enableSponsoredTx={true}
      onRequestLogin={() => openPrivyLogin()}
      onTxSubmitted={(hash) => console.log('Transaction:', hash)}
    />
  )
}
```

## Documentation

- [Installation Guide](./docs/installation.md)
- [API Reference](./docs/api-reference.md)
- [Integration Examples](./docs/examples.md)
- [Customization Guide](./docs/customization.md)
- [Security Considerations](./docs/security.md)

## Demo

Run the demo application to see the wallet panel in action:

```bash
git clone https://github.com/your-org/react-wallet-panel
cd react-wallet-panel
npm install
npm run dev
```

Visit `http://localhost:3000` to see the demo.

## Architecture

The wallet panel uses a layered architecture:

1. **Adapters Layer**: Abstracts provider-specific implementations
   - `PrivyAdapter`: EOA wallet functionality via Privy
   - `ZeroDevAdapter`: Smart account functionality via ZeroDev
   - `UnifiedWalletAdapter`: Orchestrates between providers

2. **Components Layer**: React components built with shadcn/ui
   - Modular tab-based interface
   - Responsive design
   - Accessibility features

3. **Hooks Layer**: React hooks for state management
   - `useWalletAdapter`: Provider management
   - `useWalletState`: Balance and connection state

## Integration Modes

### Privy Only
```tsx
<WalletPanel
  privyClient={privyClient}
  onRequestLogin={() => openPrivyLogin()}
/>
```

### ZeroDev Only
```tsx
<WalletPanel
  zerodev={zerodevContext}
  enableSponsoredTx={true}
/>
```

### Unified (Recommended)
```tsx
<WalletPanel
  privyClient={privyClient}
  zerodev={zerodevContext}
  enableSponsoredTx={true}
  onRequestLogin={() => openPrivyLogin()}
/>
```

## Configuration

### Chains

```tsx
const chains = [
  { id: 1, name: 'Ethereum', rpcUrl: 'https://eth.llamarpc.com' },
  { id: 137, name: 'Polygon', rpcUrl: 'https://polygon.llamarpc.com' },
  { id: 8453, name: 'Base', rpcUrl: 'https://base.llamarpc.com' },
]

<WalletPanel chains={chains} showChainSelector={true} />
```

### Tokens

```tsx
const tokens = [
  { address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b', symbol: 'USDC', decimals: 6 },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
]

<WalletPanel tokens={tokens} />
```

### Localization

```tsx
const customStrings = {
  connect: 'Connect Wallet',
  send: 'Send Assets',
  receive: 'Receive Assets',
  // ... other strings
}

<WalletPanel localeStrings={customStrings} />
```

## Security

- **No private key handling**: The component never handles raw private keys
- **Provider delegation**: All cryptographic operations are delegated to providers
- **Export callback**: Use `onRequestExport` to implement secure key management
- **Input validation**: All user inputs are validated before processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Support

- [GitHub Issues](https://github.com/your-org/react-wallet-panel/issues)
- [Documentation](./docs/)
- [Examples](./examples/)