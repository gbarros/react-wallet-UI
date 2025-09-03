# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of React Wallet Panel
- Support for Privy embedded wallet integration
- Support for ZeroDev smart account integration
- Unified wallet adapter for seamless provider switching
- Balance viewing for native tokens and ERC-20s
- Send transaction functionality with gas estimation
- Receive assets with QR code generation
- Message signing capabilities
- WalletConnect integration for external dApp connections
- Multi-chain support with chain switching
- Sponsored transaction support (gasless) via ZeroDev
- Responsive UI built with Tailwind CSS and shadcn/ui
- Comprehensive TypeScript types
- Accessibility features (a11y)
- Internationalization support (i18n)
- Comprehensive test suite
- Demo application

### Features
- **Multi-provider Architecture**: Works with Privy only, ZeroDev only, or both
- **Smart Account Support**: Full account abstraction features with ZeroDev
- **Sponsored Transactions**: Toggle between user-paid and sponsored gas
- **Chain Management**: Support for multiple chains with easy switching
- **Token Management**: Configurable ERC-20 token list with balance display
- **Security**: No private key handling, provider delegation for all crypto operations
- **Customization**: Themeable with CSS custom properties and locale strings
- **Developer Experience**: Full TypeScript support with comprehensive types

### Components
- `WalletPanel`: Main component with tabbed interface
- `BalancesTab`: Native and token balance display
- `SendTab`: Transaction sending with asset selection
- `ReceiveTab`: Address display with QR code
- `SignTab`: Message signing interface
- `WalletConnectTab`: External dApp connection management
- `AdvancedTab`: Wallet details and account switching

### Adapters
- `PrivyAdapter`: EOA wallet functionality via Privy
- `ZeroDevAdapter`: Smart account functionality via ZeroDev
- `UnifiedWalletAdapter`: Orchestrates between providers

### Utilities
- Address truncation and validation
- Balance formatting and parsing
- ENS name validation
- Identicon generation
- Clipboard operations

### Testing
- Unit tests for adapters and utilities
- Component tests with React Testing Library
- Mock providers for testing
- Comprehensive test coverage