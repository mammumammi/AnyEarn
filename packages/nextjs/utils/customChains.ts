// packages/nextjs/utils/customChains.ts
import { defineChain } from "viem";

export const virtualCelo = defineChain({
  id: 11142220,
  name: "Tenderly Sepolia Virtual Testnet",
  network: "virtualsepolia",
  nativeCurrency: { name: "Celo", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://virtual.celo-sepolia.eu.rpc.tenderly.co/3ab0aa36-60c5-437e-b388-395a6f196b8f"] },
  },
  blockExplorers: {
    default: { name: "Tenderly Dashboard", url: "https://dashboard.tenderly.co/" },
  },
  testnet: true,
  contracts: {
    multicall3: { address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  },
});
