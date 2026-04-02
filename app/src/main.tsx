import { Buffer } from "buffer";
window.Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter,
  TrustWalletAdapter,
  Coin98WalletAdapter,
  MathWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import App from "./App";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./index.css";

const endpoint = "https://api.devnet.solana.com";
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new LedgerWalletAdapter(),
  new TrustWalletAdapter(),
  new Coin98WalletAdapter(),
  new MathWalletAdapter(),
  new TorusWalletAdapter(),
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>
);
