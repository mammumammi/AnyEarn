"use client";

import React, { useState } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const TestDevPage: React.FC = () => {
  const [minting, setMinting] = useState<boolean>(false);

  const { writeContractAsync } = useScaffoldWriteContract("MintNFT");

  const { data: supply } = useScaffoldReadContract({
    contractName: "MintNFT",
    functionName: "nextId",
  });

  const handleMint = async (): Promise<void> => {
    try {
      setMinting(true);
      const tx = await writeContractAsync({
        functionName: "mint",
      });
      console.log("Minted NFT:", tx);
      alert("DTK Minted!");
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setMinting(false);
    }
  };

  return (
    <main>
      <h1>Mint A token</h1>
      <button onClick={handleMint} disabled={minting}>
        {minting ? "Minting" : "mint one"}
      </button>

      <h1>{supply}</h1>
    </main>
  );
};

export default TestDevPage;
