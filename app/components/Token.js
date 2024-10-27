import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { 
    Keypair, 
    LAMPORTS_PER_SOL, 
    SystemProgram, 
    Transaction,
    PublicKey
} from "@solana/web3.js";
import { 
    TOKEN_2022_PROGRAM_ID, 
    getMintLen, 
    createInitializeMetadataPointerInstruction, 
    createInitializeMintInstruction, 
    TYPE_SIZE, 
    LENGTH_SIZE, 
    ExtensionType,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createMintToInstruction
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useState } from 'react';

export const Token = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [mintName, setMintName] = useState();
    const [mintSymbol, setMintSymbol] = useState();
    const [decimal, setDecimal] = useState();

    const createToken = async () => {
        try{

            if (!mintName || !mintSymbol || !decimal) {
                console.log("Missing metadata!");
                return;
            }

            if (!wallet.publicKey) {
                console.log("Wallet not connected");
                return;
            }

            const mintKeypair = Keypair.generate();
            const metadata = {
                mint: mintKeypair.publicKey,
                name: mintName,
                symbol: mintSymbol,
                uri: 'https://cdn.100xdevs.com/metadata.json',
                additionalMetadata: []
            }

            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: mintLen,
                    lamports: lamports,
                    programId: TOKEN_2022_PROGRAM_ID
                }),
                createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintKeypair.publicKey, parseInt(decimal), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mintKeypair.publicKey,
                    metadata: mintKeypair.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: wallet.publicKey,
                    updateAuthority: wallet.publicKey,
                }),
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintKeypair);

            await wallet.sendTransaction(transaction, connection);

            console.log("Transaction signed");
            console.log("Mint Account: ", mintKeypair.publicKey.toBase58());

            const associatedTokenAccount = getAssociatedTokenAddressSync(
                mintKeypair.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            console.log("Associated Token Account: ", associatedTokenAccount.toBase58());

            const finalTransaction = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    new PublicKey(associatedTokenAccount),
                    wallet.publicKey,
                    mintKeypair.publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            await wallet.sendTransaction(finalTransaction, connection);

            const mintTransaction = new Transaction().add(
                createMintToInstruction(
                    mintKeypair.publicKey, 
                    new PublicKey(associatedTokenAccount), 
                    wallet.publicKey, 
                    LAMPORTS_PER_SOL, 
                    [], 
                    TOKEN_2022_PROGRAM_ID
                )
            );

            await wallet.sendTransaction(mintTransaction, connection);

            console.log("Token minted!");

        } catch(err) {
            console.log(err);
        }
    }

    return (
        <div className="flex flex-col w-full h-screen gap-4 justify-center items-center">
            <label>Token Name</label>
            <input onChange={(e)=>{setMintName(e.target.value)}} type="text" className="border w-96"></input>
            <label>Token Symbol</label>
            <input onChange={(e)=>{setMintSymbol(e.target.value)}} type="text" className="border w-96"></input>
            <label>Decimals</label>
            <input onChange={(e)=>{setDecimal(e.target.value)}} type="number" className="border w-96"></input>
            <button onClick={createToken} className="border-2 w-96">Generate Token</button>
        </div>
    )
}