"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";
import { parseEther } from "viem";
import CreateServiceForm from "./_components/CreateServiceForm";
import ServiceCard from "./_components/ServiceCard";
import MyServices from "./_components/MyServices";
import AcceptedServices from "./_components/AcceptedServices";
import GetUserLocation from "~~/components/GetUserLocation";

type Location = {
  latitude: number;
  longitude: number;
  address?: string;
};

export type Service = {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  startLocation: {
    latitude: bigint;
    longitude: bigint;
    locationAddress: string;
  };
  endLocation: {
    latitude: bigint;
    longitude: bigint;
    locationAddress: string;
  };
  reward: bigint;
  deadline: bigint;
  status: number; // 0: Active, 1: Accepted, 2: Completed, 3: Cancelled
  acceptedBy: string;
  createdAt: bigint;
  acceptedAt: bigint;
  completed: boolean;
};

const ServicesPage: React.FC = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my-services" | "accepted">("browse");
  const [activeServices, setActiveServices] = useState<bigint[]>([]);

  // Read active services
  const { data: activeServiceIds, refetch: refetchActiveServices } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getActiveServices",
    args: [],
  });

  useEffect(() => {
    if (activeServiceIds) {
      setActiveServices(activeServiceIds);
    }
  }, [activeServiceIds]);

  const handleServiceAction = () => {
    // Refetch active services after any action
    refetchActiveServices();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Service Tracking</h1>
          <p className="text-xl text-gray-300">Create, browse, and accept location-based services</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-slate-800 rounded-xl p-1 flex space-x-1">
            {[
              { key: "browse", label: "Browse Services", icon: "🔍" },
              { key: "create", label: "Create Service", icon: "➕" },
              { key: "my-services", label: "My Services", icon: "📋" },
              { key: "accepted", label: "Accepted", icon: "✅" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {!address && (
            <div className="text-center py-12">
              <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-300 mb-6">Please connect your wallet to access the service tracking system.</p>
                <div className="text-orange-400">🔗 Connect Wallet</div>
              </div>
            </div>
          )}

          {address && (
            <>
              {/* Browse Services Tab */}
              {activeTab === "browse" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Available Services</h2>
                  {activeServices.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-slate-800 rounded-xl p-8">
                        <h3 className="text-xl font-semibold text-white mb-2">No Active Services</h3>
                        <p className="text-gray-300">No services are currently available. Be the first to create one!</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeServices.map((serviceId) => (
                        <ServiceCard
                          key={serviceId.toString()}
                          serviceId={serviceId}
                          onAction={handleServiceAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Create Service Tab */}
              {activeTab === "create" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Create New Service</h2>
                  <CreateServiceForm onServiceCreated={handleServiceAction} />
                </div>
              )}

              {/* My Services Tab */}
              {activeTab === "my-services" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">My Created Services</h2>
                  <MyServices onServiceAction={handleServiceAction} />
                </div>
              )}

              {/* Accepted Services Tab */}
              {activeTab === "accepted" && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">My Accepted Services</h2>
                  <AcceptedServices onServiceAction={handleServiceAction} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
