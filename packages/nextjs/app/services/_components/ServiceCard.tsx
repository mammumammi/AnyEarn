"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { formatEther } from "viem";
import { Service } from "../page";

interface Props {
  serviceId: bigint;
  onAction: () => void;
}

const ServiceCard: React.FC<Props> = ({ serviceId, onAction }) => {
  const { address } = useAccount();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  // Read service details
  const { data: serviceData, refetch: refetchService } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getService",
    args: [serviceId],
  });

  const { writeContractAsync: writeServiceManagerAsync } = useScaffoldWriteContract({
    contractName: "ServiceManager",
  });

  useEffect(() => {
    if (serviceData) {
      setService(serviceData as Service);
      setLoading(false);
    }
  }, [serviceData]);

  const handleAcceptService = async () => {
    try {
      await writeServiceManagerAsync({
        functionName: "acceptService",
        args: [serviceId],
      });
      onAction();
    } catch (error) {
      console.error("Error accepting service:", error);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatDateTime = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-green-500";
      case 1: return "bg-yellow-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Active";
      case 1: return "Accepted";
      case 2: return "Completed";
      case 3: return "Cancelled";
      default: return "Unknown";
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6 animate-pulse">
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

  if (!service) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <p className="text-red-400">Failed to load service details</p>
      </div>
    );
  }

  const isExpired = Number(service.deadline) < Math.floor(Date.now() / 1000);
  const canAccept = service.status === 0 && !isExpired && service.creator !== address;

  return (
    <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{service.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(service.status)}`}>
          {getStatusText(service.status)}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 line-clamp-3">{service.description}</p>

      {/* Creator */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Created by:</p>
        <Address address={service.creator} />
      </div>

      {/* Locations */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">📍 Start Location:</p>
          <p className="text-white text-sm">{service.startLocation.locationAddress || "Custom Location"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">🎯 End Location:</p>
          <p className="text-white text-sm">{service.endLocation.locationAddress || "Custom Location"}</p>
        </div>
      </div>

      {/* Reward and Deadline */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">Reward:</p>
          <p className="text-orange-400 font-semibold">{formatEther(service.reward)} ETH</p>
        </div>
        <div>
          <p className="text-sm text-gray-400 mb-1">Deadline:</p>
          <p className={`text-sm ${isExpired ? "text-red-400" : "text-white"}`}>
            {formatDate(service.deadline)}
          </p>
        </div>
      </div>

      {/* Accepted by */}
      {service.status === 1 && service.acceptedBy && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Accepted by:</p>
          <Address address={service.acceptedBy} />
          <p className="text-xs text-gray-500 mt-1">
            Accepted on: {formatDateTime(service.acceptedAt)}
          </p>
        </div>
      )}

      {/* Action Button */}
      {canAccept && (
        <button
          onClick={handleAcceptService}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300"
        >
          Accept Service
        </button>
      )}

      {isExpired && service.status === 0 && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-center py-3 px-4 rounded-lg">
          Service Expired
        </div>
      )}

      {/* Created Date */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-gray-500">
          Created: {formatDateTime(service.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
