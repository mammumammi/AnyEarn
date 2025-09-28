"use client";

import React, { useState, useEffect } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";

interface ServiceNFTDisplayProps {
  tokenId: bigint;
  showDetails?: boolean;
}

interface ServiceNFTData {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  startLat: bigint;
  startLon: bigint;
  startAddress: string;
  endLat: bigint;
  endLon: bigint;
  endAddress: string;
  reward: bigint;
  deadline: bigint;
  acceptedBy: string;
  completed: boolean;
  burned: boolean;
  createdAt: bigint;
  acceptedAt: bigint;
  completedAt: bigint;
}

const ServiceNFTDisplay: React.FC<ServiceNFTDisplayProps> = ({ tokenId, showDetails = true }) => {
  const [serviceData, setServiceData] = useState<ServiceNFTData | null>(null);
  const [loading, setLoading] = useState(true);

  // Read service data from NFT
  const { data: nftData } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getServiceDataFromNFT",
    args: [tokenId],
  });

  useEffect(() => {
    if (nftData) {
      setServiceData({
        id: nftData[0] as bigint,
        creator: nftData[1] as string,
        title: nftData[2] as string,
        description: nftData[3] as string,
        startLat: nftData[4] as bigint,
        startLon: nftData[5] as bigint,
        startAddress: nftData[6] as string,
        endLat: nftData[7] as bigint,
        endLon: nftData[8] as bigint,
        endAddress: nftData[9] as string,
        reward: nftData[10] as bigint,
        deadline: nftData[11] as bigint,
        acceptedBy: nftData[12] as string,
        completed: nftData[13] as boolean,
        burned: nftData[14] as boolean,
        createdAt: nftData[15] as bigint,
        acceptedAt: nftData[16] as bigint,
        completedAt: nftData[17] as bigint,
      });
      setLoading(false);
    }
  }, [nftData]);

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatCoordinates = (lat: bigint, lon: bigint) => {
    const latNum = Number(lat) / 1000000;
    const lonNum = Number(lon) / 1000000;
    return `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`;
  };

  const getStatusColor = () => {
    if (serviceData?.burned) return "bg-green-500";
    if (serviceData?.completed) return "bg-blue-500";
    if (serviceData?.acceptedBy && serviceData.acceptedBy !== "0x0000000000000000000000000000000000000000") return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getStatusText = () => {
    if (serviceData?.burned) return "Completed & Burned";
    if (serviceData?.completed) return "Completed";
    if (serviceData?.acceptedBy && serviceData.acceptedBy !== "0x0000000000000000000000000000000000000000") return "In Progress";
    return "Active";
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-slate-700 rounded mb-4"></div>
        <div className="h-4 bg-slate-700 rounded mb-2"></div>
        <div className="h-4 bg-slate-700 rounded mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-700 rounded w-20"></div>
          <div className="h-8 bg-slate-700 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="bg-slate-800 rounded-xl p-4">
        <p className="text-red-400">Failed to load NFT data</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{serviceData.title}</h3>
          <p className="text-sm text-gray-400">NFT Token ID: #{serviceData.id.toString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4">{serviceData.description}</p>

      {/* NFT Badge */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">NFT</span>
          </div>
          <span className="text-orange-400 font-medium">Service NFT</span>
        </div>
        <p className="text-orange-300 text-sm mt-1">
          This service is represented as an NFT. When accepted, ownership is shared. When completed, the NFT is burned and reward is distributed.
        </p>
      </div>

      {showDetails && (
        <>
          {/* Creator */}
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-1">Created by:</p>
            <p className="text-white font-mono text-sm">{serviceData.creator.slice(0, 6)}...{serviceData.creator.slice(-4)}</p>
          </div>

          {/* Locations */}
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">📍 Start Location:</p>
              <p className="text-white text-sm">{serviceData.startAddress || "Custom Location"}</p>
              <p className="text-xs text-gray-500">{formatCoordinates(serviceData.startLat, serviceData.startLon)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">🎯 End Location:</p>
              <p className="text-white text-sm">{serviceData.endAddress || "Custom Location"}</p>
              <p className="text-xs text-gray-500">{formatCoordinates(serviceData.endLat, serviceData.endLon)}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Reward:</p>
              <p className="text-orange-400 font-semibold">{formatEther(serviceData.reward)} ETH</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Deadline:</p>
              <p className="text-white text-sm">{formatDate(serviceData.deadline)}</p>
            </div>
          </div>

          {/* Accepted by */}
          {serviceData.acceptedBy && serviceData.acceptedBy !== "0x0000000000000000000000000000000000000000" && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400 mb-1">Accepted by:</p>
              <p className="text-white font-mono text-sm">{serviceData.acceptedBy.slice(0, 6)}...{serviceData.acceptedBy.slice(-4)}</p>
              {serviceData.acceptedAt > 0n && (
                <p className="text-xs text-blue-300 mt-1">
                  Accepted on: {formatDate(serviceData.acceptedAt)}
                </p>
              )}
            </div>
          )}

          {/* Completion info */}
          {serviceData.completed && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400 mb-1">Completed:</p>
              <p className="text-white text-sm">{formatDate(serviceData.completedAt)}</p>
              {serviceData.burned && (
                <p className="text-xs text-green-300 mt-1">NFT has been burned and reward distributed</p>
              )}
            </div>
          )}

          {/* NFT Metadata */}
          <div className="pt-4 border-t border-slate-700">
            <p className="text-xs text-gray-500">
              Created: {formatDate(serviceData.createdAt)} | 
              NFT ID: {serviceData.id.toString()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceNFTDisplay;
