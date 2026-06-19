declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toString(): string };
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
    };
  }
}

export interface Wallet {
  connected: boolean;
  publicKey: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => Promise<void>;
}

export function getWallet(): Wallet {
  return {
    connected: !!window.solana?.publicKey,
    publicKey: window.solana?.publicKey?.toString() ?? null,
    async connect() {
      if (!window.solana?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return null;
      }
      try {
        const resp = await window.solana.connect();
        return resp.publicKey.toString();
      } catch {
        return null;
      }
    },
    async disconnect() {
      if (!window.solana) return;
      try {
        await window.solana.disconnect();
      } catch {
        // ignore
      }
    },
  };
}
