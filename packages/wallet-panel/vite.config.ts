import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'WalletPanel',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@privy-io/react-auth',
        '@zerodev/waas',
        'wagmi',
        'viem',
        '@walletconnect/modal',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@privy-io/react-auth': 'PrivyReactAuth',
          '@zerodev/waas': 'ZeroDevWaas',
          wagmi: 'Wagmi',
          viem: 'Viem',
          '@walletconnect/modal': 'WalletConnectModal',
        },
      },
    },
  },
})