import type { PrivyClientLike, ZeroDevContextLike } from '../types'

export const mockPrivyClient: PrivyClientLike = {
  user: {
    wallet: {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    },
  },
  authenticated: true,
  ready: true,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  getEthereumProvider: vi.fn().mockReturnValue({
    request: vi.fn().mockImplementation(({ method }) => {
      switch (method) {
        case 'personal_sign':
          return Promise.resolve('0x' + '0'.repeat(130))
        case 'eth_sendTransaction':
          return Promise.resolve('0x' + '1'.repeat(64))
        case 'eth_chainId':
          return Promise.resolve('0x1')
        case 'wallet_switchEthereumChain':
          return Promise.resolve(null)
        default:
          return Promise.reject(new Error(`Unsupported method: ${method}`))
      }
    }),
  }),
}

export const mockZeroDevContext: ZeroDevContextLike = {
  projectId: 'test-project-id',
  isConnected: true,
  address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  sendUserOperation: vi.fn().mockResolvedValue({
    hash: '0x' + '2'.repeat(64),
    userOpHash: '0x' + '3'.repeat(64),
  }),
  switchChain: vi.fn().mockResolvedValue(undefined),
}

export const mockDisconnectedPrivyClient: PrivyClientLike = {
  user: undefined,
  authenticated: false,
  ready: true,
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  getEthereumProvider: vi.fn().mockReturnValue(null),
}

export const mockDisconnectedZeroDevContext: ZeroDevContextLike = {
  projectId: 'test-project-id',
  isConnected: false,
  address: undefined,
  sendUserOperation: vi.fn().mockRejectedValue(new Error('Not connected')),
  switchChain: vi.fn().mockRejectedValue(new Error('Not connected')),
}