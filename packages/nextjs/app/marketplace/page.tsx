"use client";

import { useState, useEffect } from "react";
import { parseEther, formatEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";
import GetUserLocation, { Coordinates } from "~~/components/GetUserLocation";
import axios from "axios";

interface Service {
  id: number;
  owner: string;
  acceptor: string | null;
  title: string;
  description: string;
  price: string;
  active: boolean;
  location?: Coordinates;
  address?: string;
  distance?: string;
}

export default function ServiceMarketplace() {
  const { address: account } = useAccount();
  const { writeContractAsync: writeServiceManagerAsync } = useScaffoldWriteContract({
    contractName: "ServiceManager",
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('browse');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [servicesWithDistance, setServicesWithDistance] = useState<Service[]>([]);

  // Read all services
  const { data: rawServices, refetch: refetchServices } = useScaffoldReadContract({
    contractName: "ServiceManager",
    functionName: "getAllServices",
  });

  // Parse services data
  const services: Service[] = rawServices?.map((s: any) => ({
    id: Number(s.id),
    owner: s.owner,
    acceptor: s.acceptor === "0x0000000000000000000000000000000000000000" ? null : s.acceptor,
    title: s.title,
    description: s.description,
    price: formatEther(s.price),
    active: s.active,
  })) || [];

  // Handle location
  const handleLocation = (coords: Coordinates, address?: string) => {
    setUserLocation(coords);
    setUserAddress(address ?? null);
    setShowLocationPrompt(false);
  };

  const resetLocation = () => {
    setUserLocation(null);
    setUserAddress(null);
    setShowLocationPrompt(true);
  };

  // Calculate distances for services
  useEffect(() => {
    const calculateDistances = async () => {
      if (!userLocation || services.length === 0) return;

      const servicesWithDistances = await Promise.all(
        services.map(async (service) => {
          // For demo purposes, we'll generate random locations near the user
          // In a real app, you'd store actual service locations
          const serviceLat = userLocation.lat + (Math.random() - 0.5) * 0.1;
          const serviceLon = userLocation.lon + (Math.random() - 0.5) * 0.1;
          
          try {
            const response = await axios.post('/api/distance', {
              userLat: userLocation.lat,
              userLon: userLocation.lon,
              serviceLat: serviceLat,
              serviceLon: serviceLon,
            });
            
            return {
              ...service,
              location: { lat: serviceLat, lon: serviceLon },
              distance: response.data.distance
            };
          } catch (error) {
            console.error('Error calculating distance:', error);
            return {
              ...service,
              location: { lat: serviceLat, lon: serviceLon },
              distance: 'N/A'
            };
          }
        })
      );

      // Sort by distance
      servicesWithDistances.sort((a, b) => {
        if (a.distance === 'N/A') return 1;
        if (b.distance === 'N/A') return -1;
        return parseFloat(a.distance || '0') - parseFloat(b.distance || '0');
      });

      setServicesWithDistance(servicesWithDistances);
    };

    calculateDistances();
  }, [userLocation, services]);

  // Host a new service
  const handleHostService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price) return;

    try {
      await writeServiceManagerAsync({
        functionName: "hostService",
        args: [title, description, parseEther(price)],
        value: parseEther(price),
      });
      setTitle("");
      setDescription("");
      setPrice("");
      setActiveTab('browse');
      refetchServices();
    } catch (err) {
      console.error("Failed to host service:", err);
    }
  };

  // Accept a service
  const acceptService = async (id: number) => {
    try {
      await writeServiceManagerAsync({
        functionName: "acceptService",
        args: [BigInt(id)],
      });
      refetchServices();
    } catch (err) {
      console.error("Failed to accept service:", err);
    }
  };

  // Complete a service
  const completeService = async (id: number) => {
    try {
      await writeServiceManagerAsync({
        functionName: "completeService",
        args: [BigInt(id)],
      });
      refetchServices();
    } catch (err) {
      console.error("Failed to complete service:", err);
    }
  };

  return (
    <div className="min-h-screen bg-navy-gradient text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-glow rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Service Marketplace
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Host and discover services on the blockchain with our decentralized marketplace
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass-card rounded-2xl p-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'browse'
                  ? 'bg-orange-glow text-black shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Browse Services
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'create'
                  ? 'bg-orange-glow text-black shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Create Service
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Location Prompt */}
          {showLocationPrompt && (
            <div className="glass-card rounded-3xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">📍 Set Your Location First</h3>
              <p className="text-gray-300 mb-6">
                To show you the nearest services and calculate distances, we need to know your location.
              </p>
              <GetUserLocation onLocation={handleLocation} />
            </div>
          )}

          {/* Location Display */}
          {userLocation && (
            <div className="glass-card rounded-3xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Your Location</h3>
                <button
                  onClick={resetLocation}
                  className="text-orange-400 hover:text-orange-300 text-sm underline"
                >
                  Change Location
                </button>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Coordinates:</span>
                <span className="text-orange-400 font-mono">
                  {userLocation.lat.toFixed(6)}, {userLocation.lon.toFixed(6)}
                </span>
              </div>
              {userAddress && (
                <div className="flex justify-between items-start text-sm mt-2">
                  <span className="text-gray-400">Address:</span>
                  <span className="text-white text-right max-w-xs">{userAddress}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'create' ? (
            /* Create Service Form */
            <div className="glass-card-navy rounded-3xl p-8 shadow-2xl mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6 text-center">Host a New Service</h2>
              <form onSubmit={handleHostService} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Service Title</label>
                  <input
                    type="text"
                    placeholder="Enter service title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-800/50 border border-orange-500/30 text-white p-4 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    placeholder="Describe your service in detail"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-800/50 border border-orange-500/30 text-white p-4 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent h-32 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Price (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-800/50 border border-orange-500/30 text-white p-4 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-orange-glow hover:shadow-lg text-black px-6 py-4 rounded-xl transition-all duration-300 font-medium"
                >
                  Host Service
                </button>
              </form>
            </div>
          ) : (
            /* Services List */
            <div className="glass-card-navy rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {userLocation ? 'Nearest Services' : 'Available Services'}
                </h2>
                <span className="text-orange-400 font-medium">
                  {userLocation ? servicesWithDistance.length : services.length} services
                </span>
              </div>
              
              {(!userLocation ? services : servicesWithDistance).length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-400 text-lg">No services available yet. Be the first to host one!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {(!userLocation ? services : servicesWithDistance).map((service) => (
                    <div key={service.id} className="bg-slate-800/50 rounded-2xl p-6 border border-orange-500/10 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">{service.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          service.active 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {service.active ? "Active" : "Closed"}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3">{service.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-orange-400">{service.price} ETH</span>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">ID: #{service.id}</div>
                          {service.distance && (
                            <div className="text-xs text-blue-400 mt-1">
                              📍 {service.distance} km away
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {service.active && !service.acceptor && account !== service.owner && (
                          <button
                            onClick={() => acceptService(service.id)}
                            className="w-full bg-orange-glow hover:shadow-lg text-black px-4 py-2 rounded-lg transition-all duration-300 font-medium"
                          >
                            Accept Service
                          </button>
                        )}
                        
                        {service.active && service.acceptor === account && (
                          <button
                            onClick={() => completeService(service.id)}
                            className="w-full bg-navy-glow hover:shadow-lg text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium"
                          >
                            Complete Service
                          </button>
                        )}

                        {account === service.owner && (
                          <div className="text-xs text-gray-400 text-center">
                            Your service
                          </div>
                        )}

                        {service.acceptor && service.acceptor !== account && account !== service.owner && (
                          <div className="text-xs text-gray-400 text-center">
                            Already accepted
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-2">{services.length}</div>
            <div className="text-gray-300">Total Services</div>
          </div>
          <div className="glass-card-navy rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {services.filter(s => s.active).length}
            </div>
            <div className="text-gray-300">Active Services</div>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-orange-400 mb-2">
              {services.reduce((sum, s) => sum + parseFloat(s.price), 0).toFixed(2)}
            </div>
            <div className="text-gray-300">Total Value (ETH)</div>
          </div>
          <div className="glass-card-navy rounded-2xl p-6 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {userLocation ? servicesWithDistance.filter(s => parseFloat(s.distance || '0') < 5).length : 'N/A'}
            </div>
            <div className="text-gray-300">Within 5km</div>
          </div>
        </div>
      </div>
    </div>
  );
}
