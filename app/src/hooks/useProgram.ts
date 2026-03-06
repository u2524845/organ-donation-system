import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { useMemo } from "react";
import idl from "../idl.json";
import type { OrganDonationSystem } from "../types";

export const PROGRAM_ID = new PublicKey("7DtCGYSvSrpDJDEegvzjZKWibD6zi2rvzxPdYZiAVuvN");

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program<OrganDonationSystem>(idl as any, provider);
  }, [connection, wallet]);
}

// PDA helper
export function getPda(seeds: Buffer[], programId = PROGRAM_ID): PublicKey {
  return PublicKey.findProgramAddressSync(seeds, programId)[0];
}
