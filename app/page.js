"use client";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Wallet } from './components/Wallet';
import { Token } from './components/Token';

export default function Home() {
  const endpoint = "https://api.devnet.solana.com";
  return (
    <div>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={[]}>
          <WalletModalProvider>
            <Wallet/>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <Token/>
    </div>
  )
}
