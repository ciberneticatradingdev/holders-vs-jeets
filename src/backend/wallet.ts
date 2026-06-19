// ============================================================
// Wallet Login — Solana Phantom
// ============================================================

export interface WalletState {
  connected: boolean
  address: string | null
  connecting: boolean
}

// Phantom provider type
interface PhantomProvider {
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>
  disconnect: () => Promise<void>
  publicKey: { toString(): string } | null
  isConnected: boolean
  isPhantom?: boolean
  signMessage: (message: Uint8Array, display?: string) => Promise<{ signature: Uint8Array }>
  on: (event: string, handler: (...args: any[]) => void) => void
}

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider
    }
    solana?: PhantomProvider
  }
}

export function getPhantomProvider(): PhantomProvider | null {
  if (typeof window === 'undefined') return null
  const provider = window.phantom?.solana || window.solana
  if (provider?.isPhantom) return provider
  return null
}

export function isPhantomInstalled(): boolean {
  return !!getPhantomProvider()
}

export async function connectWallet(): Promise<string | null> {
  const provider = getPhantomProvider()
  if (!provider) {
    // Open Phantom website
    window.open('https://phantom.app/', '_blank')
    return null
  }

  try {
    const resp = await provider.connect()
    return resp.publicKey.toString()
  } catch (err) {
    console.error('Wallet connect error:', err)
    return null
  }
}

export async function disconnectWallet(): Promise<void> {
  const provider = getPhantomProvider()
  if (provider) {
    try { await provider.disconnect() } catch {}
  }
}

export async function signWalletMessage(message: string): Promise<{ signature: string; address: string } | null> {
  const provider = getPhantomProvider()
  if (!provider) return null

  try {
    const encoded = new TextEncoder().encode(message)
    const { signature } = await provider.signMessage(encoded, 'utf8')
    return {
      signature: Array.from(signature).map((b: number) => b.toString(16).padStart(2, '0')).join(''),
      address: provider.publicKey!.toString(),
    }
  } catch (err) {
    console.error('Sign error:', err)
    return null
  }
}

export function shortAddress(addr: string | null): string {
  if (!addr) return ''
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

export function onWalletChange(callback: (address: string | null) => void) {
  const provider = getPhantomProvider()
  if (!provider) return
  provider.on('accountChanged', (publicKey: any) => {
    if (publicKey) callback(publicKey.toString())
    else callback(null)
  })
  provider.on('disconnect', () => callback(null))
}
