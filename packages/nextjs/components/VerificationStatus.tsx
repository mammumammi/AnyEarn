"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import Link from "next/link";

interface VerificationData {
  isVerified: boolean;
  fullName: string;
  attestationId: string;
  verifiedAt: bigint;
}

const VerificationStatus: React.FC = () => {
  const { address } = useAccount();
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  // Read user verification status from ServiceManager
  const { data: userInfo, refetch: refetchUserInfo } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getUserInfo",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (userInfo) {
      setVerificationData({
        isVerified: userInfo[0] as boolean,
        fullName: userInfo[1] as string,
        attestationId: userInfo[2] as string,
        verifiedAt: userInfo[3] as bigint,
      });
      setLoading(false);
    } else if (address) {
      setLoading(false);
    }
  }, [userInfo, address]);

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  if (!address) {
    return (
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-gray-400 text-center">Connect your wallet to check verification status</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded mb-2"></div>
          <div className="h-3 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      {verificationData?.isVerified ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <h3 className="text-green-400 font-semibold">Verified User</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="text-white ml-2">{verificationData.fullName}</span>
            </div>
            
            {verificationData.verifiedAt > 0n && (
              <div>
                <span className="text-gray-400">Verified on:</span>
                <span className="text-white ml-2">{formatDate(verificationData.verifiedAt)}</span>
              </div>
            )}
            
            <div>
              <span className="text-gray-400">Attestation ID:</span>
              <span className="text-white ml-2 font-mono text-xs">
                {verificationData.attestationId.slice(0, 8)}...{verificationData.attestationId.slice(-8)}
              </span>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-700">
            <p className="text-green-300 text-xs">
              ✓ You can create and accept services
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h3 className="text-red-400 font-semibold">Not Verified</h3>
          </div>
          
          <p className="text-gray-300 text-sm">
            You need to complete identity verification to create or accept services.
          </p>
          
          <Link 
            href="/selftest"
            className="inline-block w-full bg-orange-500 hover:bg-orange-600 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors duration-300"
          >
            Complete Verification
          </Link>
          
          <div className="pt-2 border-t border-slate-700">
            <p className="text-red-300 text-xs">
              ✗ Cannot create or accept services until verified
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;
