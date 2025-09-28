'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function VerificationPage() {
  const { address, isConnected, isConnecting } = useAccount();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeContractAsync: writeUserVerificationAsync } = useScaffoldWriteContract({
    contractName: "UserVerification",
  });

  console.log("Wallet state:", { address, isConnected, isConnecting });

  const handleVerificationSuccess = async (attestationId: string, discloseOutput?: any) => {
    console.log("Verification successful!", attestationId, discloseOutput);
    setLoading(true);

    if (!address) {
      setError("Wallet not connected");
      setLoading(false);
      return;
    }

    // For demo purposes, use mock data if not provided
    const firstName = discloseOutput?.firstName || "John";
    const lastName = discloseOutput?.lastName || "Doe";

    try {
      await writeUserVerificationAsync({
        functionName: "selfVerify",
        args: [address, firstName, lastName, attestationId],
      });
      setSuccess(true);
      console.log("User verified and stored on-chain ✅");
    } catch (err) {
      console.error("Error storing user on-chain:", err);
      setError("Failed to store verification on-chain");
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet connection states
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Connecting Wallet</h1>
          <p className="text-gray-300">Please wait while we connect your wallet...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-gray-300 mb-6">Please connect your wallet to start the verification process.</p>
          <div className="mb-6">
            <p className="text-orange-400">🔗 Please use the wallet connection button in the header</p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Debug: isConnected={String(isConnected)}, address={address ? "present" : "missing"}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-400 mb-4">Verification Complete!</h1>
          <p className="text-green-300 mb-6">
            Your identity has been successfully verified. You can now create and accept services on AnyEarn.
          </p>
          <div className="space-y-2 text-sm text-gray-300">
            <p><strong>Wallet:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
          <button
            onClick={() => window.location.href = '/services'}
            className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
          >
            Go to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Identity Verification</h1>
          <p className="text-xl text-gray-300">Complete your identity verification to use AnyEarn services</p>
          <div className="mt-4 p-3 bg-slate-700 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-gray-300">
              <strong>Wallet Status:</strong> {isConnected ? "✅ Connected" : "❌ Not Connected"}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "None"}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
              <h3 className="text-red-400 font-semibold mb-2">Verification Error</h3>
              <p className="text-red-300">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(false);
                }}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="bg-slate-800 rounded-xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">Demo Verification</h2>
              <p className="text-gray-300">For testing purposes, you can simulate verification</p>
            </div>

            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
                  <p className="text-gray-300">Processing verification...</p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    const mockAttestationId = `demo_attestation_${Date.now()}`;
                    const mockDiscloseOutput = {
                      firstName: "Demo",
                      lastName: "User"
                    };
                    handleVerificationSuccess(mockAttestationId, mockDiscloseOutput);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 text-lg"
                >
                  Simulate Verification
                </button>
              )}
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 font-medium mb-2">Instructions:</h3>
              <ol className="text-sm text-blue-300 space-y-1 text-left">
                <li>1. Click "Simulate Verification" to test the flow</li>
                <li>2. This will store your wallet address as verified</li>
                <li>3. You can then create and accept services</li>
                <li>4. In production, this would use SelfCore QR scanning</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
