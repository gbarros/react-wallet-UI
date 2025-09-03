import React, { useState } from 'react'

// Mock wallet panel component for demo
function MockWalletPanel({ 
  mode, 
  onConnect 
}: { 
  mode: string
  onConnect: () => void 
}) {
  const [activeTab, setActiveTab] = useState('balances')
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    setIsConnected(true)
    onConnect()
  }

  if (!isConnected) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 w-full max-w-sm shadow-sm">
        <div className="text-center">
          <div className="mb-4 p-3 rounded-full bg-gray-100 w-16 h-16 mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
          <p className="text-sm text-gray-600 mb-6">
            Connect your wallet to view balances and manage assets
          </p>
          <button
            onClick={handleConnect}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg w-full max-w-sm shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
            0x
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">0x742d...d8b6</span>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {mode === 'unified' ? 'Smart Account' : mode === 'privy-only' ? 'EOA Account' : 'Smart Account'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {['balances', 'send', 'receive', 'sign'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'balances' && (
          <div className="space-y-3">
            <h3 className="font-semibold">Balances</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                  <div>
                    <div className="font-medium">ETH</div>
                    <div className="text-sm text-gray-500">Ethereum</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">1.234</div>
                  <div className="text-sm text-gray-500">ETH</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="font-medium">USDC</div>
                    <div className="text-sm text-gray-500">USD Coin</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">1,000.00</div>
                  <div className="text-sm text-gray-500">USDC</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'send' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Send Assets</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Recipient</label>
                <input
                  type="text"
                  placeholder="0x... or name.eth"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  placeholder="0.0"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              {mode !== 'privy-only' && (
                <div className="flex items-center justify-between p-3 border border-gray-300 rounded-md">
                  <div>
                    <div className="text-sm font-medium">Sponsored Transaction</div>
                    <div className="text-xs text-gray-500">Gas fees covered</div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                  </div>
                </div>
              )}
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        )}

        {activeTab === 'receive' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Receive Assets</h3>
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <div className="text-gray-400">QR Code</div>
              </div>
              <div className="text-sm text-gray-600 mb-2">Your Address</div>
              <div className="p-2 bg-gray-50 rounded text-xs font-mono break-all">
                0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sign' && (
          <div className="space-y-4">
            <h3 className="font-semibold">Sign Message</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea
                  placeholder="Enter message to sign..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Sign Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
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