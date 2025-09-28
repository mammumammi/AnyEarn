"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

interface VerificationHandlerProps {
  onVerificationComplete: () => void;
}

interface VerificationData {
  attestationId: string;
  proof: any;
  publicSignals: any;
  userContextData: any;
}

const VerificationHandler: React.FC<VerificationHandlerProps> = ({ onVerificationComplete }) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // This would typically be called by the owner/admin to verify users
  // For demo purposes, we'll create a simple interface
  const handleVerifyUser = async (verificationData: VerificationData) => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First, verify with SelfCore backend
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationData),
      });

      const result = await response.json();

      if (result.status === "success" && result.result) {
        // Extract user data from SelfCore response
        const discloseOutput = result.data;
        
        // For now, we'll use placeholder data since the actual verification
        // would need to be done by the contract owner
        console.log("Verification successful:", discloseOutput);
        
        setSuccess(true);
        onVerificationComplete();
      } else {
        setError(result.reason || "Verification failed");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify user");
    } finally {
      setLoading(false);
    }
  };

  const simulateVerification = async () => {
    if (!address) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate successful verification
      // In a real implementation, this would be triggered by the SelfCore QR code
      const mockData = {
        attestationId: `attestation_${Date.now()}`,
        proof: {},
        publicSignals: {},
        userContextData: {
          firstName: "John",
          lastName: "Doe",
        },
      };

      await handleVerifyUser(mockData);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify user");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-green-400 mb-2">Verification Complete!</h3>
        <p className="text-green-300 mb-4">
          Your identity has been verified. You can now create and accept services.
        </p>
        <p className="text-sm text-gray-400">
          Note: In a production environment, verification would be processed by the contract owner.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Complete Identity Verification</h3>
      
      <div className="space-y-4">
        <p className="text-gray-300">
          To use AnyEarn services, you need to complete identity verification using SelfCore.
        </p>
        
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">Verification Process:</h4>
          <ol className="text-sm text-blue-300 space-y-1 list-decimal list-inside">
            <li>Scan the QR code on the verification page with the Self app</li>
            <li>Complete the identity verification process</li>
            <li>Your verification will be processed and stored on the blockchain</li>
            <li>You'll be able to create and accept services</li>
          </ol>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/selftest', '_blank')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
          >
            Open Verification Page
          </button>
          
          <button
            onClick={simulateVerification}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
          >
            {loading ? "Verifying..." : "Simulate Verification"}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationHandler;
