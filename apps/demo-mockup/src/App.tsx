import React, { useState } from 'react'
import { WalletPanel } from '@wallet-panel/react'
import type { ChainConfig, Erc20 } from '@wallet-panel/react'

// Mock providers for the demo
function createMockPrivyClient(isConnected: boolean) {
  return {
    ready: true,
    authenticated: isConnected,
    user: isConnected ? {
      wallet: {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
      }
    } : undefined,
    login: async () => {
      console.log('Mock Privy login')
    },
    logout: async () => {
      console.log('Mock Privy logout')
    },
    getEthereumProvider: async () => ({
      request: async () => '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    })
  }
}

function createMockZeroDevContext(isConnected: boolean) {
  return {
    projectId: 'mock-project-id',
    isConnected,
    address: isConnected ? '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6' : undefined,
    sendUserOperation: async () => ({
      hash: '0xmockhash',
      userOpHash: '0xmockuserophash'
    }),
    switchChain: async () => {
      console.log('Mock chain switch')
    },
    kernelClient: null,
    isLoading: false,
    error: null,
    connect: async () => {
      console.log('Mock ZeroDev connect')
    }
  }
}

// Mock chains and tokens
const mockChains: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://sepolia.gateway.tenderly.co',
  },
  {
    id: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon.llamarpc.com',
  },
]

const mockTokens: Erc20[] = [
  {
    address: '0xA0b86a33E6441c8C673f4e6c8c5c3B3c8f3e3f3e',
    symbol: 'USDC',
    decimals: 6,
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    decimals: 6,
  },
]

// Wrapper component that manages connection state
function MockWalletPanel({ 
  mode, 
  onConnect 
}: { 
  mode: string
  onConnect: () => void 
}) {
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(true)
    onConnect()
  }

  const handleDisconnect = () => {
    setIsConnected(false)
  }

  const getProviders = () => {
    switch (mode) {
      case 'privy-only':
        return { 
          privyClient: createMockPrivyClient(isConnected), 
          zerodev: undefined 
        }
      case 'zerodev-only':
        return { 
          privyClient: undefined, 
          zerodev: createMockZeroDevContext(isConnected) 
        }
      case 'unified':
      default:
        return { 
          privyClient: createMockPrivyClient(isConnected), 
          zerodev: createMockZeroDevContext(isConnected) 
        }
    }
  }

  const { privyClient, zerodev } = getProviders()

  return (
    <WalletPanel
      privyClient={privyClient}
      zerodev={zerodev}
      chains={mockChains}
      tokens={mockTokens}
      enableSponsoredTx={mode !== 'privy-only'}
      showWalletConnect={true}
      showChainSelector={true}
      onRequestLogin={handleConnect}
      onTxSubmitted={(hash: string) => {
        console.log('Mock transaction submitted:', hash)
        alert(`Mock transaction submitted: ${hash.slice(0, 10)}...`)
      }}
      onSign={(signature: string, message: string) => {
        console.log('Mock message signed:', { signature, message })
        alert('Mock message signed successfully!')
      }}
      onRequestExport={() => {
        console.log('Mock export requested')
        alert('Mock export functionality')
      }}
      // Add custom disconnect handler
      adapter={isConnected ? {
        isReady: () => true,
        isConnected: () => true,
        isSmartAccountActive: () => mode !== 'privy-only',
        login: handleConnect,
        logout: handleDisconnect,
        switchChain: async () => console.log('Mock chain switch'),
        sendTransaction: async () => ({ hash: '0xmockhash' }),
        signMessage: async () => '0xmocksignature',
        getAddress: () => '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        getChainId: () => 1,
        getBalance: async () => BigInt('1234000000000000000'),
        estimateGas: async () => BigInt('21000')
      } : undefined}
    />
  )
}

function App() {
  const [mode, setMode] = useState<'privy-only' | 'zerodev-only' | 'unified'>('unified')
  const [showPanel, setShowPanel] = useState(true)

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
                <MockWalletPanel
                  mode={mode}
                  onConnect={() => console.log('Connected!')}
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Installation</h3>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
{`npm install @wallet-panel/react

# Peer dependencies
npm install react react-dom
npm install @privy-io/react-auth
npm install @zerodev/waas
npm install wagmi viem`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            This is a demo of the React Wallet Panel component.
            <br />
            The actual component integrates with Privy and ZeroDev for real wallet functionality.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App