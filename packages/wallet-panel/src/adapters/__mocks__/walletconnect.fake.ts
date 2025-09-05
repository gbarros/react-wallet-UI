// Deterministic test data
export const FAKE_WC_URI = 'wc:test-session@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=test-key'
export const FAKE_DAPP_NAME = 'Test DApp'
export const FAKE_DAPP_URL = 'https://test-dapp.com'
export const FAKE_SESSION_TOPIC = 'test-session-topic-123'

export interface FakeWalletConnectAdapter {
  // Core methods
  openModal: () => void
  closeModal: () => void
  connect: (uri: string) => Promise<void>
  disconnect: (topic: string) => Promise<void>
  
  // State
  isModalOpen: boolean
  connectedSessions: Array<{
    topic: string
    name: string
    url: string
    icon?: string
  }>
  
  // Test utilities
  _callCounts: {
    openModal: number
    closeModal: number
    connect: number
    disconnect: number
  }
  
  _setModalOpen: (open: boolean) => void
  _addSession: (session: { topic: string; name: string; url: string; icon?: string }) => void
  _removeSession: (topic: string) => void
}

export function createFakeWalletConnectAdapter(): FakeWalletConnectAdapter {
  const callCounts = {
    openModal: 0,
    closeModal: 0,
    connect: 0,
    disconnect: 0,
  }

  let modalOpen = false
  let sessions: Array<{ topic: string; name: string; url: string; icon?: string }> = []

  return {
    isModalOpen: modalOpen,
    connectedSessions: sessions,
    _callCounts: callCounts,

    openModal() {
      callCounts.openModal++
      modalOpen = true
    },

    closeModal() {
      callCounts.closeModal++
      modalOpen = false
    },

    async connect(_uri: string) {
      callCounts.connect++
      // Simulate successful connection
      const session = {
        topic: FAKE_SESSION_TOPIC,
        name: FAKE_DAPP_NAME,
        url: FAKE_DAPP_URL,
      }
      sessions.push(session)
    },

    async disconnect(topic: string) {
      callCounts.disconnect++
      sessions = sessions.filter(s => s.topic !== topic)
    },

    // Test utilities
    _setModalOpen(open: boolean) {
      modalOpen = open
    },

    _addSession(session: { topic: string; name: string; url: string; icon?: string }) {
      sessions.push(session)
    },

    _removeSession(topic: string) {
      sessions = sessions.filter(s => s.topic !== topic)
    },
  }
}
