import React, { useState } from 'react'
import { WalletPanel } from '@wallet-panel/react'
import type { ChainConfig, Erc20 } from '@wallet-panel/react'

// Mock Privy client for demo
const mockPrivyClient = {
  user: {
    wallet: {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    },
  },
  authenticated: true,
  ready: true,
  login: async () => {
    console.log('Mock Privy login')
  },
  logout: async () => {
    console.log('Mock Privy logout')
  },
  getEthereumProvider: () => ({
    request: async ({ method, params }: any) => {
      console.log('Mock provider request:', method, params)
      
      switch (method) {
        case 'personal_sign':
          return '0x' + '0'.repeat(130) // Mock signature
        case 'eth_sendTransaction':
          return '0x' + '1'.repeat(64) // Mock transaction hash
        case 'eth_chainId':
          return '0x1' // Ethereum mainnet
        case 'wallet_switchEthereumChain':
          return null
        default:
          throw new Error(`Unsupported method: ${method}`)
      }
    },
  }),
}

// Mock ZeroDev context for demo
const mockZeroDevContext = {
  projectId: 'demo-project-id',
  isConnected: true,
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' as const,
  sendUserOperation: async (tx: any) => {
    console.log('Mock ZeroDev sendUserOperation:', tx)
    return {
      hash: '0x' + '2'.repeat(64),
      userOpHash: '0x' + '3'.repeat(64),
    }
  },
  switchChain: async (chainId: number) => {
    console.log('Mock ZeroDev switchChain:', chainId)
  },
}

// Demo configuration
const demoChains: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon.llamarpc.com',
  },
  {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://base.llamarpc.com',
  },
]

const demoTokens: Erc20[] = [
  {
    address: '0xA0b86a33E6441c8C7c7b0b8b0b8b0b8b0b8b0b8b',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
  },
]

function App() {
  const [mode, setMode] = useState<'privy-only' | 'zerodev-only' | 'unified'>('unified')
  const [showPanel, setShowPanel] = useState(true)

  const getProviders = () => {
    switch (mode) {
      case 'privy-only':
        return { privyClient: mockPrivyClient, zerodev: undefined }
      case 'zerodev-only':
        return { privyClient: undefined, zerodev: mockZeroDevContext }
      case 'unified':
        return { privyClient: mockPrivyClient, zerodev: mockZeroDevContext }
      default:
        return { privyClient: undefined, zerodev: undefined }
    }
  }

  const { privyClient, zerodev } = getProviders()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            React Wallet Panel Demo
          </h1>
          <p className="text-lg text-gray-600">
            Drop-in wallet component with Privy and ZeroDev integration
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="unified">Privy + ZeroDev</option>
                <option value="privy-only">Privy Only</option>
                <option value="zerodev-only">ZeroDev Only</option>
              </select>
            </div>
            
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              {showPanel ? 'Hide Panel' : 'Show Panel'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Wallet Panel */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900">Wallet Panel</h2>
            
            {showPanel ? (
              <div className="flex justify-center">
                <WalletPanel
                  privyClient={privyClient}
                  zerodev={zerodev}
                  chains={demoChains}
                  tokens={demoTokens}
                  enableSponsoredTx={true}
                  showWalletConnect={true}
                  showChainSelector={true}
                  onRequestLogin={() => {
                    console.log('Login requested')
                    alert('Login flow would be triggered here')
                  }}
                  onTxSubmitted={(hash) => {
                    console.log('Transaction submitted:', hash)
                    alert(`Transaction submitted: ${hash.slice(0, 10)}...`)
                  }}
                  onSign={(signature, message) => {
                    console.log('Message signed:', { signature, message })
                    alert(`Message signed successfully!`)
                  }}
                  onRequestExport={() => {
                    console.log('Export requested')
                    alert('Export/migration flow would be triggered here')
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                Panel hidden - click "Show Panel" to display
              </div>
            )}
          </div>

          {/* Documentation */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Core Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ View native and ERC-20 token balances</li>
                <li>✅ Send transactions with gas estimation</li>
                <li>✅ Receive assets with QR code</li>
                <li>✅ Sign arbitrary messages</li>
                <li>✅ WalletConnect integration</li>
                <li>✅ Chain switching</li>
                <li>✅ Smart account support</li>
                <li>✅ Sponsored transactions (gasless)</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Modes</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <strong>Privy Only:</strong> EOA wallet with embedded auth
                </div>
                <div>
                  <strong>ZeroDev Only:</strong> Smart account with AA features
                </div>
                <div>
                  <strong>Unified:</strong> Both providers with smart account preference
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Usage</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`<WalletPanel
  privyClient={privyClient}
  zerodev={zerodevContext}
  chains={chains}
  tokens={tokens}
  enableSponsoredTx={true}
  onRequestLogin={() => openLogin()}
  onTxSubmitted={(hash) => console.log(hash)}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            This is a demo of the React Wallet Panel component.
            <br />
            All transactions are mocked and no real funds are involved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App