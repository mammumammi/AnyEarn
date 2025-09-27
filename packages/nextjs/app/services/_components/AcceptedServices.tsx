"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { formatEther } from "viem";
import { Service } from "../page";
import NavigationHelper from "./NavigationHelper";

interface Props {
  onServiceAction: () => void;
}

const AcceptedServices: React.FC<Props> = ({ onServiceAction }) => {
  const { address } = useAccount();
  const [acceptedServices, setAcceptedServices] = useState<bigint[]>([]);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNavigation, setShowNavigation] = useState<Service | null>(null);

  // Read user's accepted services
  const { data: acceptedServiceIds } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getAcceptedServices",
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  const { writeContractAsync: writeServiceManagerAsync } = useScaffoldWriteContract({
    contractName: "ServiceManager",
  });

  useEffect(() => {
    if (acceptedServiceIds) {
      setAcceptedServices([...acceptedServiceIds]);
    }
  }, [acceptedServiceIds]);

  // Load service details for each service
  useEffect(() => {
    const loadServices = async () => {
      if (acceptedServices.length === 0) {
        setServicesData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const services: Service[] = [];
      
      for (const serviceId of acceptedServices) {
        try {
          // Note: This would ideally be done with a batch read, but for simplicity we'll simulate it
          // In a real implementation, you'd want to batch these calls
          services.push({
            id: serviceId,
            creator: "",
            title: "Loading...",
            description: "",
            startLocation: { latitude: 0n, longitude: 0n, locationAddress: "" },
            endLocation: { latitude: 0n, longitude: 0n, locationAddress: "" },
            reward: 0n,
            deadline: 0n,
            status: 0,
            acceptedBy: address || "",
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
  }, [acceptedServices, address]);

  const handleCompleteService = async (serviceId: bigint) => {
    try {
      await writeServiceManagerAsync({
        functionName: "completeService",
        args: [serviceId],
      });
      onServiceAction();
    } catch (error) {
      console.error("Error completing service:", error);
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
          <h3 className="text-xl font-semibold text-white mb-2">No Accepted Services</h3>
          <p className="text-gray-300">You haven't accepted any services yet. Browse available services to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {servicesData.map((service) => {
        const isExpired = Number(service.deadline) < Math.floor(Date.now() / 1000);
        const canComplete = service.status === 1; // Can only complete accepted services

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

            {/* Creator */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-1">Created by:</p>
              <Address address={service.creator} />
            </div>

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
                  <div>
                    <p className="text-xs text-gray-500">Accepted on:</p>
                    <p className="text-white text-sm">{formatDateTime(service.acceptedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Instructions */}
            {canComplete && (
              <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">📍 Navigation Instructions</h4>
                <div className="text-sm text-blue-300 space-y-1">
                  <p>1. Navigate to the start location: <span className="font-medium">{service.startLocation.locationAddress || "Custom Location"}</span></p>
                  <p>2. Complete the service task</p>
                  <p>3. Navigate to the end location: <span className="font-medium">{service.endLocation.locationAddress || "Custom Location"}</span></p>
                  <p>4. Mark the service as completed</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <div className="text-xs text-gray-500">
                Service ID: #{service.id.toString()}
              </div>
              
              <div className="flex space-x-2">
                {canComplete && (
                  <>
                    <button
                      onClick={() => setShowNavigation(service)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      🗺️ Navigate
                    </button>
                    <button
                      onClick={() => handleCompleteService(service.id)}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      Mark as Completed
                    </button>
                  </>
                )}
              </div>

              {service.status === 2 && (
                <div className="flex items-center space-x-2">
                  <span className="text-green-400 text-sm font-medium">✓ Completed</span>
                  <span className="text-orange-400 text-sm">+{formatEther(service.reward)} ETH</span>
                </div>
              )}

              {isExpired && service.status === 1 && (
                <span className="text-red-400 text-sm font-medium">Deadline Passed</span>
              )}
            </div>
          </div>
        );
      })}

      {/* Navigation Helper Modal */}
      {showNavigation && (
        <NavigationHelper
          service={showNavigation}
          onClose={() => setShowNavigation(null)}
        />
      )}
    </div>
  );
};

export default AcceptedServices;
