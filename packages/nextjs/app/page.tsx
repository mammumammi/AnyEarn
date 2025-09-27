"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import GetUserLocation, { Coordinates } from "~~/components/GetUserLocation";
import { useState, useEffect } from "react";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

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

  return (
    <div className="min-h-screen bg-navy-gradient text-white">
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 text-center">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2 text-gray-300">Welcome to</span>
            <span className="block text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              AnyEarn
            </span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium text-gray-300">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          {/* App Description */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="glass-card-navy rounded-3xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">About AnyEarn</h2>
              <p className="text-lg text-gray-300 mb-4">
                AnyEarn is a revolutionary microservices platform where users can earn money by providing services to others in their local area. 
                Whether you need help with tasks, want to offer your skills, or are looking for location-based services, AnyEarn connects you with 
                opportunities right in your neighborhood.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-slate-800/30 rounded-xl p-4 border border-orange-500/20">
                  <h3 className="text-orange-400 font-semibold mb-2">🎯 Location-Based Services</h3>
                  <p className="text-gray-300 text-sm">Find and offer services within your local area using GPS technology</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-orange-500/20">
                  <h3 className="text-orange-400 font-semibold mb-2">💰 Earn Money</h3>
                  <p className="text-gray-300 text-sm">Complete tasks and services to earn cryptocurrency payments</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-blue-600/20">
                  <h3 className="text-blue-400 font-semibold mb-2">🔒 Blockchain Security</h3>
                  <p className="text-gray-300 text-sm">All transactions are secured and transparent on the blockchain</p>
                </div>
                <div className="bg-slate-800/30 rounded-xl p-4 border border-blue-600/20">
                  <h3 className="text-blue-400 font-semibold mb-2">📱 Easy to Use</h3>
                  <p className="text-gray-300 text-sm">Simple interface to create, find, and manage services</p>
                </div>
              </div>
            </div>

            {/* Location Prompt */}
            {showLocationPrompt && (
              <div className="glass-card rounded-3xl p-8 mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">📍 Set Your Location First</h3>
                <p className="text-gray-300 mb-6">
                  To show you the nearest services and opportunities, we need to know your location. 
                  This helps us connect you with local tasks and services in your area.
                </p>
                <GetUserLocation onLocation={handleLocation} />
              </div>
            )}

            {/* Location Display */}
            {userLocation && (
              <div className="glass-card rounded-3xl p-6 mb-6">
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grow w-full mt-8 px-8 py-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Quick Actions</h2>
          <div className="flex justify-center items-center gap-6 flex-col md:flex-row max-w-5xl mx-auto">
            <Link href="/marketplace" className="group">
              <div className="flex flex-col glass-card px-8 py-8 text-center items-center max-w-xs rounded-3xl card-hover">
                <div className="w-14 h-14 bg-orange-glow rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Service Marketplace</h3>
                <p className="text-gray-300 text-sm">
                  Browse and create location-based services to earn money
                </p>
              </div>
            </Link>

            <Link href="/locationtest" className="group">
              <div className="flex flex-col glass-card-navy px-8 py-8 text-center items-center max-w-xs rounded-3xl card-hover-navy">
                <div className="w-14 h-14 bg-navy-glow rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Location Services</h3>
                <p className="text-gray-300 text-sm">
                  Manage your location settings and preferences
                </p>
              </div>
            </Link>

            <Link href="/selftest" className="group">
              <div className="flex flex-col glass-card px-8 py-8 text-center items-center max-w-xs rounded-3xl card-hover">
                <div className="w-14 h-14 bg-orange-glow rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Verification</h3>
                <p className="text-gray-300 text-sm">
                  Complete identity verification and testing
                </p>
              </div>
            </Link>

            <Link href="/debug" className="group">
              <div className="flex flex-col glass-card-navy px-8 py-8 text-center items-center max-w-xs rounded-3xl card-hover-navy">
                <div className="w-14 h-14 bg-navy-glow rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BugAntIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Debug Contracts</h3>
                <p className="text-gray-300 text-sm">
                  Test and debug smart contracts
                </p>
              </div>
            </Link>

            <Link href="/blockexplorer" className="group">
              <div className="flex flex-col glass-card px-8 py-8 text-center items-center max-w-xs rounded-3xl card-hover">
                <div className="w-14 h-14 bg-orange-glow rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MagnifyingGlassIcon className="h-7 w-7 text-black" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Block Explorer</h3>
                <p className="text-gray-300 text-sm">
                  Explore blockchain transactions
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
