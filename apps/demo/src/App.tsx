import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { PrivyProvider } from '@privy-io/react-auth'
import { WalletPanel, WalletTrigger } from '@wallet-panel/react'
import type { ChainConfig, Erc20 } from '@wallet-panel/react'
import { useZeroDev } from './hooks/useZeroDev'
import './index.css'

// Environment configuration
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID

// Demo configuration
const demoChains: ChainConfig[] = [
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

// Demo component that uses Privy
function DemoContent() {
  const { ready, authenticated, user, login, logout, getEthereumProvider } = usePrivy()
  const [mode, setMode] = useState<'privy-only' | 'zerodev-only' | 'unified'>('unified')
  const [showPanel, setShowPanel] = useState(true)
  const [displayMode, setDisplayMode] = useState<'inline' | 'modal'>('inline')

  // Initialize ZeroDev hook with error handling
  const zeroDevContext = useZeroDev()

  // Create a proper PrivyClientLike object
  const privyClientLike = ready ? {
    ready,
    authenticated,
    user: user ? {
      wallet: user.wallet ? {
        address: user.wallet.address
      } : undefined
    } : undefined,
    login: async () => { 
      await login()
      // After Privy login, trigger ZeroDev connection
      if (zeroDevContext.connect) {
        await zeroDevContext.connect()
      }
    },
    logout,
    getEthereumProvider
  } : undefined

  const getProviders = () => {
    switch (mode) {
      case 'privy-only':
        return { privyClient: privyClientLike, zerodev: undefined }
      case 'zerodev-only':
        return { privyClient: undefined, zerodev: zeroDevContext }
      case 'unified':
        return { privyClient: privyClientLike, zerodev: zeroDevContext }
      default:
        return { privyClient: undefined, zerodev: undefined }
    }
  }

  const { privyClient, zerodev } = getProviders()

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Privy...</p>
        </div>
      </div>
    )
  }

  // Show error if ZeroDev failed to initialize
  if (zeroDevContext.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-900 mb-4">ZeroDev Error</h1>
          <p className="text-red-600 mb-4">{zeroDevContext.error}</p>
          <div className="bg-red-100 p-3 rounded text-left text-sm">
            <p>Check your ZeroDev configuration:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Project ID: {zeroDevContext.projectId}</li>
              <li>Environment variables are set correctly</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state if ZeroDev is still initializing
  if (zeroDevContext.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Smart Account...</p>
        </div>
      </div>
    )
  }

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
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
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
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Display:</label>
                <select
                  value={displayMode}
                  onChange={(e) => setDisplayMode(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="inline">Inline Panel</option>
                  <option value="modal">Modal Overlay</option>
                </select>
              </div>
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
              displayMode === 'modal' ? (
                <div className="flex justify-center">
                  <WalletTrigger
                    privyClient={privyClient}
                    zerodev={zerodev}
                    chains={demoChains}
                    tokens={demoTokens}
                    enableSponsoredTx={true}
                    showWalletConnect={true}
                    showChainSelector={true}
                    modalTitle="Demo Wallet"
                    onRequestLogin={async () => {
                      console.log('Login requested')
                      await login()
                      // After Privy login, trigger ZeroDev connection
                      if (zeroDevContext.connect) {
                        await zeroDevContext.connect()
                      }
                    }}
                    onTxSubmitted={(hash: string) => {
                      console.log('Transaction submitted:', hash)
                      alert(`Transaction submitted: ${hash.slice(0, 10)}...`)
                    }}
                    onSign={(signature: string, message: string) => {
                      console.log('Message signed:', { signature, message })
                      alert(`Message signed successfully!`)
                    }}
                    onRequestExport={() => {
                      console.log('Export requested')
                      alert('Export functionality would be triggered here')
                    }}
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <WalletPanel
                    privyClient={privyClient}
                    zerodev={zerodev}
                    chains={demoChains}
                    tokens={demoTokens}
                    enableSponsoredTx={true}
                    showWalletConnect={true}
                    showChainSelector={true}
                    onRequestLogin={async () => {
                      console.log('Login requested')
                      await login()
                      // After Privy login, trigger ZeroDev connection
                      if (zeroDevContext.connect) {
                        await zeroDevContext.connect()
                      }
                    }}
                    onTxSubmitted={(hash: string) => {
                      console.log('Transaction submitted:', hash)
                      alert(`Transaction submitted: ${hash.slice(0, 10)}...`)
                    }}
                    onSign={(signature: string, message: string) => {
                      console.log('Message signed:', { signature, message })
                      alert(`Message signed successfully!`)
                    }}
                    onRequestExport={() => {
                      console.log('Export requested')
                      alert('Export functionality would be triggered here')
                    }}
                  />
                </div>
              )
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
              <h3 className="text-lg font-semibold mb-4">Environment Setup</h3>
              <div className="text-sm space-y-2">
                <p>Copy <code>.env.example</code> to <code>.env</code> and fill in your API keys:</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>VITE_PRIVY_APP_ID: Your Privy app ID</li>
                  <li>VITE_ZERODEV_PROJECT_ID: Your ZeroDev project ID</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>
            This is a demo of the React Wallet Panel component.
            <br />
            {!PRIVY_APP_ID && <span className="text-orange-600">⚠️ Set VITE_PRIVY_APP_ID in .env to use real authentication</span>}
          </p>
        </div>
      </div>
    </div>
  )
}

// Force clear Privy storage on app load if needed
const clearPrivyStorage = () => {
  try {
    // Clear localStorage entries related to Privy
    Object.keys(localStorage).forEach(key => {
      if (key.includes('privy') || key.includes('wallet')) {
        localStorage.removeItem(key)
      }
    })
    // Clear sessionStorage entries related to Privy
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('privy') || key.includes('wallet')) {
        sessionStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Could not clear storage:', error)
  }
}

// Main App component with Privy provider
function App() {
  // Uncomment the line below if you need to force clear storage
  // clearPrivyStorage()
  
  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Environment Setup Required</h1>
          <p className="text-gray-600 mb-4">
            Please copy <code>.env.example</code> to <code>.env</code> and add your Privy App ID to get started.
          </p>
          <div className="bg-gray-100 p-3 rounded text-left text-sm">
            <code>VITE_PRIVY_APP_ID=your_privy_app_id_here</code>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PrivyProvider 
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        // Disable auto-login to prevent automatic reconnection after logout
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <DemoContent />
    </PrivyProvider>
  )
}

export default App