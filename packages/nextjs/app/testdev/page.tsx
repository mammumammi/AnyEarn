"use client";

import React, { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";

const TestDevPage: React.FC = () => {
  const [minting, setMinting] = useState(false);
  const [fractionalizing, setFractionalizing] = useState(false);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [totalShares, setTotalShares] = useState<number>(100);
  const [fractionAddress, setFractionAddress] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "MintNFT",
  });

  const { data: supply } = useScaffoldReadContract({
    contractName: "MintNFT",
    functionName: "nextId",
  });

  const handleMint = async () => {
    try {
      setMinting(true);
      const txHash = await writeContractAsync({
        functionName: "mint",
      });

      console.log("Mint tx hash:", txHash);

      if (supply !== undefined) {
        setTokenId(Number(supply)); // new tokenId = current nextId
      }
      alert("NFT Minted!");
    } catch (e) {
      console.error("Mint error:", e);
    } finally {
      setMinting(false);
    }
  };

  const handleFractionalize = async () => {
    if (tokenId == null) {
      alert("No token minted yet");
      return;
    }

    try {
      setFractionalizing(true);
      const txHash = await writeContractAsync({
        functionName: "fractionalizeNft",
        args: [BigInt(tokenId), BigInt(totalShares)],
      });

      console.log("Fractionalize tx hash:", txHash);

      if (!publicClient) {
        alert("Public client not initialized");
        return;
      }
      if (!txHash) {
        alert("Transaction failed");
        return;
      }
      
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      

      // Decode event log
      for (const _log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: [
              {
                type: "event",
                name: "FractionalizedNFT",
                inputs: [
                  { indexed: true, name: "owner", type: "address" },
                  { indexed: false, name: "tokenId", type: "uint256" },
                  { indexed: false, name: "fractionalizedToken", type: "address" },
                ],
              },
            ],
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "FractionalizedNFT") {
            setFractionAddress(decoded.args.fractionalizedToken as string);
            console.log("Fractional Token Address:", decoded.args.fractionalizedToken);
          }
        } catch {
          // skip unrelated logs
        }
      }

      alert("NFT Fractionalized!");
    } catch (e) {
      console.error("Fractionalize error:", e);
    } finally {
      setFractionalizing(false);
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Mint a Token</h1>
      <button onClick={handleMint} disabled={minting} className="px-4 py-2 bg-blue-500 text-white rounded mt-2">
        {minting ? "Minting..." : "Mint One"}
      </button>

      <h2 className="mt-4">Next Token ID: {supply?.toString()}</h2>

      <div className="flex flex-col mt-6 gap-2">
        <h1 className="text-xl font-bold">Fractionalize Token</h1>
        <input
          type="number"
          value={totalShares}
          onChange={(e) => setTotalShares(Number(e.target.value))}
          placeholder="Total shares"
          className="border p-2 rounded"
        />
        <button
          onClick={handleFractionalize}
          disabled={fractionalizing}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          {fractionalizing ? "Fractionalizing..." : "Fractionalize NFT"}
        </button>

        {fractionAddress && (
          <p className="mt-2 text-sm">Fractional Token Address: {fractionAddress}</p>
        )}
      </div>
    </main>
  );
};

export default TestDevPage;
