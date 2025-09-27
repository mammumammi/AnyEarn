"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { formatEther } from "viem";
import { Service } from "../page";

interface Props {
  onServiceAction: () => void;
}

const MyServices: React.FC<Props> = ({ onServiceAction }) => {
  const { address } = useAccount();
  const [userServices, setUserServices] = useState<bigint[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Read user's services
  const { data: userServiceIds } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getUserServices",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const { writeContractAsync: writeServiceManagerAsync } = useScaffoldWriteContract({
    contractName: "ServiceManager",
  });

  useEffect(() => {
    if (userServiceIds) {
      setUserServices([...userServiceIds]);
    }
  }, [userServiceIds]);

  // Load service details for each service
  useEffect(() => {
    const loadServices = async () => {
      if (userServices.length === 0) {
        setServicesData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const services: Service[] = [];
      
      for (const serviceId of userServices) {
        try {
          // Note: This would ideally be done with a batch read, but for simplicity we'll simulate it
          // In a real implementation, you'd want to batch these calls
          services.push({
            id: serviceId,
            creator: address || "",
            title: "Loading...",
            description: "",
            startLocation: { latitude: 0n, longitude: 0n, locationAddress: "" },
            endLocation: { latitude: 0n, longitude: 0n, locationAddress: "" },
            reward: 0n,
            deadline: 0n,
            status: 0,
            acceptedBy: "",
            createdAt: 0n,
            acceptedAt: 0n,
            completed: false,
          });
        } catch (error) {
          console.error("Error loading service:", error);
        }
      }
      
      setServicesData(services);
      setLoading(false);
    };

    loadServices();
  }, [userServices, address]);

  const handleCancelService = async (serviceId: bigint) => {
    try {
      await writeServiceManagerAsync({
        functionName: "cancelService",
        args: [serviceId],
      });
      onServiceAction();
    } catch (error) {
      console.error("Error cancelling service:", error);
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-slate-700 rounded mb-4"></div>
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-4 bg-slate-700 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-8 bg-slate-700 rounded w-20"></div>
              <div className="h-8 bg-slate-700 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (servicesData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-slate-800 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-2">No Services Created</h3>
          <p className="text-gray-300">You haven't created any services yet. Create your first service to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {servicesData.map((service) => {
        const isExpired = Number(service.deadline) < Math.floor(Date.now() / 1000);
        const canCancel = service.status === 0; // Can only cancel active services

        return (
          <div key={service.id.toString()} className="bg-slate-800 rounded-xl p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{service.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(service.status)}`}>
                {getStatusText(service.status)}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 mb-4">{service.description}</p>

            {/* Service Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Locations</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">📍 Start:</p>
                    <p className="text-white text-sm">{service.startLocation.locationAddress || "Custom Location"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">🎯 End:</p>
                    <p className="text-white text-sm">{service.endLocation.locationAddress || "Custom Location"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Details</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Reward:</p>
                    <p className="text-orange-400 font-semibold">{formatEther(service.reward)} ETH</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deadline:</p>
                    <p className={`text-sm ${isExpired ? "text-red-400" : "text-white"}`}>
                      {formatDate(service.deadline)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Accepted by */}
            {service.status === 1 && service.acceptedBy && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Accepted by:</p>
                <Address address={service.acceptedBy} />
                <p className="text-xs text-gray-500 mt-2">
                  Accepted on: {formatDateTime(service.acceptedAt)}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div className="text-xs text-gray-500">
                Created: {formatDateTime(service.createdAt)}
              </div>
              
              {canCancel && (
                <button
                  onClick={() => handleCancelService(service.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Cancel Service
                </button>
              )}

              {isExpired && service.status === 0 && (
                <span className="text-red-400 text-sm font-medium">Expired</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyServices;
