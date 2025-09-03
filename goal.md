Goal: Build a drop-in React/TypeScript wallet panel that gives end-users basic wallet functions (see balances, copy address, receive, send, sign message, connect via WalletConnect) while abstracting over Privy (auth + embedded wallet) and ZeroDev (AA smart account). It must feel like a plug-in: minimal setup, optional + progressive features, safe defaults. Ideal for dapps that onboard with Privy and (optionally) use ZeroDev for AA/paymasters.

Deliverables
	•	A production-ready npm package (and a demo app) exporting a default React component:
	•	WalletPanel – a compact, responsive panel/modal with basic wallet functions.
	•	Framework: React + TypeScript, Vite build, Tailwind for styling, shadcn/ui components, viem for chain calls, wagmi for React web3 state.
	•	Works with: Privy (@privy-io/react-auth), ZeroDev (@zerodev/waas), and WalletConnect v2 (modal).
	•	No backend required; everything runs client-side with providers passed in.
	•	Accessibility (a11y) and i18n-ready (simple key/value dictionary prop).

High-level behavior
	•	If Privy is present and the user is authenticated, the component uses Privy’s wallet as the signer/provider.
	•	If ZeroDev context is provided, it exposes AA features (gasless toggle, userOp status, session keys if available).
	•	If both are present, prefer ZeroDev smart account as the active account, with a visible toggle to switch to the underlying EOA (advanced section).
	•	If neither is present, render a “Connect / Sign in” CTA and expose an onRequestLogin callback so the host app can open its login flow.

Feature set (MVP)
	1.	Header
	•	Identicon + truncated address
	•	Chain selector (optional, controlled via props)
	•	Copy address button
	2.	Balances
	•	Native token balance
	•	ERC-20 balances for a configurable token list (by address + decimals + symbol)
	3.	Receive
	•	Show QR code + address (with copy)
	4.	Send
	•	Simple send form:
	•	To: address / ENS
	•	Asset: native or selected ERC-20
	•	Amount
	•	Gas mode: toggle between “Sponsored (paymaster)” and “User pays” (only show sponsored if ZeroDev is wired/provided)
	•	Submit → returns tx hash or userOp hash
	5.	Sign Message
	•	Text box to sign arbitrary message; returns signature
	6.	WalletConnect
	•	Button to open WalletConnect modal to connect this account to external dapps (optional via prop)
	7.	Advanced (collapsible)
	•	Show full address, account type: EOA vs Smart Account
	•	If Smart Account (AA), show owner(s) info if available (read-only), nonce, last userOp
	•	Optional “Export / Manage custody” CTA that fires a callback (onRequestExport) for host app to implement (no raw key handling in this lib)

Public API (component props)

```
type ChainConfig = {
  id: number;              // e.g. 1, 137, 8453, etc.
  rpcUrl?: string;
  name?: string;
  logoUrl?: string;
};

type Erc20 = {
  address: `0x${string}`;
  symbol: string;
  decimals: number;
  logoUrl?: string;
};

type WalletPanelProps = {
  /** Provided by host app */
  privyClient?: PrivyClientLike;                // optional
  zerodev?: ZeroDevContextLike;                 // optional (e.g., projectId, hooks)
  wagmiConfig?: Config;                         // for viem/wagmi provider + chains

  /** UI/UX toggles */
  showChainSelector?: boolean;
  showWalletConnect?: boolean;
  defaultCollapsed?: boolean;

  /** Assets and chains */
  chains?: ChainConfig[];                       // defaults to wagmi chains
  tokens?: Erc20[];                             // optional curated token list

  /** Sponsored transactions */
  enableSponsoredTx?: boolean;                  // if true and zerodev present, show gasless toggle

  /** Callbacks */
  onRequestLogin?: () => void;                  // called when not logged in
  onTxSubmitted?: (hashOrUserOp: string) => void;
  onTxConfirmed?: (receipt: unknown) => void;
  onSign?: (sig: string, message: string) => void;
  onRequestExport?: () => void;                 // host implements export/migration flow

  /** i18n */
  localeStrings?: Record<string, string>;       // keys: "connect", "copy", "send", etc.
  className?: string;
};
```

Internal architecture
	•	Adapters layer to abstract providers:
	•	PrivyAdapter – expose getSigner(), getAddress(), signMessage(), sendTransaction().
	•	ZeroDevAdapter – expose AA equivalents: getSmartAccountAddress(), sendUserOp(), isSponsoredEnabled, setSponsored.
	•	Unified WalletAdapter that prefers ZeroDev smart account if available; falls back to Privy EOA signer.
	•	State management via wagmi hooks and React Query (if needed) for balances and token metadata.
	•	Gas estimation: viem + wagmi; when sponsored mode is on, route via ZeroDev/paymaster path.
	•	Chain switching: rely on wagmi configuration; if using smart account, ensure chain support is validated.

UX constraints
	•	Minimal, one-file install experience for host app:
	•	The demo should show:
```
<PrivyProvider ...>
  <ZeroDevProvider projectId="..." ...>
    <WagmiConfig config={config}>
      <WalletPanel
        enableSponsoredTx
        showWalletConnect
        tokens={[{ address: '0xToken...', symbol: 'USDC', decimals: 6 }]}
        onRequestLogin={() => openPrivyLogin()}
      />
    </WagmiConfig>
  </ZeroDevProvider>
</PrivyProvider>
```


	•	No key export logic inside the component (security). Instead, expose onRequestExport so the dapp can route to its own advanced custody/migration flow.
	•	Small footprint: tree-shakeable, code-split modal assets, zero heavy icons by default.

Dependencies (peerDependencies where appropriate)
	•	react, react-dom
	•	@privy-io/react-auth (peer)
	•	@zerodev/waas (peer)
	•	wagmi, viem
	•	@walletconnect/modal (optional peer)
	•	zustand or React state only (keep light)
	•	tailwindcss
	•	@radix-ui/react-* via shadcn/ui

Acceptance criteria
	1.	If only Privy is present and the user is authenticated:
	•	Panel shows EOA address, balances, can send and sign message.
	•	WalletConnect works (optional).
	2.	If Privy + ZeroDev are present:
	•	Panel defaults to Smart Account (same global address across chains if provided by the SDK).
	•	Sponsored mode toggle appears and routes through ZeroDev.
	•	Sending ERC-20/native works via userOps; success returns a userOp hash then final tx hash once included.
	3.	If neither is present:
	•	Panel shows a “Sign in” view and calls onRequestLogin when the user clicks connect.
	4.	Works on at least Ethereum mainnet + one L2 in the demo (e.g., Base/Optimism).
	5.	Clean, modern UI (shadcn + Tailwind), responsive, keyboard accessible, and i18n-ready.

Nice-to-have (if time allows)
	•	ENS resolution for recipients
	•	QR code for receive tab
	•	Recent activity list (pull via RPC / public indexer if trivial; otherwise stub with prop)
	•	Session key toggle (if ZeroDev exposes it simply)

Testing
	•	Unit tests for adapters and send/sign flows.
	•	E2E happy-path in demo: login with Privy → smart account detected (if ZeroDev) → send USDC on a testnet with sponsored gas.

Documentation
	•	README with:
	•	Install + peer deps
	•	Minimal setup for: Privy only, Privy + ZeroDev
	•	Props reference
	•	Example snippets
	•	Security note about export/migration (onRequestExport)

Design intent: This must feel like RainbowKit-lite for embedded wallets: a tiny drop-in that restores user agency (balances, send, sign, WC) without the dapp author writing custom plumbing. Privy handles login, ZeroDev upgrades to smart accounts + sponsored gas, and the component abstracts it behind one consistent UI.