"use client";
import dynamic from "next/dynamic";
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
)
const WalletDisconnectButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletDisconnectButton,
    { ssr: false }
)
import "@solana/wallet-adapter-react-ui/styles.css";

export const Wallet = () => {
    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <WalletMultiButtonDynamic/>
            <WalletDisconnectButtonDynamic/>
        </div>
    )
}