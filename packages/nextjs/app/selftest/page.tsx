'use client';

import React, { useState, useEffect } from 'react';
import { getUniversalLink } from "@selfxyz/core";
import { SelfQRcodeWrapper, SelfAppBuilder, type SelfApp } from "@selfxyz/qrcode";
import { ethers } from "ethers";

export default function VerificationPage() {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState(ethers.ZeroAddress); // Replace with wallet address if needed

  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "AnyEarn",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "anyearn-scope",
        endpoint: process.env.NEXT_PUBLIC_SELF_ENDPOINT || "https://playground.self.xyz/api/verify",
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_https",
        userIdType: "hex",
        userDefinedData: "Some optional data",
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, [userId]);

  const handleVerificationSuccess = (attestationId: string) => {
    console.log("Verification successful!", attestationId);

    // Optionally call your backend to store verification
    fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attestationId }),
    }).then(res => res.json())
      .then(data => console.log("Backend response:", data));
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Verify Your Identity</h1>
      <p>Scan this QR code with the Self app</p>

      {selfApp ? (
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={handleVerificationSuccess}
          onError={() => console.error("Verification failed")}
        />
      ) : (
        <div>Loading QR Code...</div>
      )}

      <p>Or scan using this universal link:</p>
      {universalLink && <a href={universalLink}>{universalLink}</a>}
    </div>
  );
}
