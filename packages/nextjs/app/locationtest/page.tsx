"use client";

import { useState } from "react";
import GetUserLocation, {Coordinates} from "~~/components/GetUserLocation";

export default function Home() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  const handleLocation = (c: Coordinates, addr?: string) => {
    setCoords(c);
    setAddress(addr ?? null);
  };

  return (
    <div className="min-h-screen bg-navy-gradient text-white">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-glow rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Location Services
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Enable location-based services for your Web3 experience. Choose your preferred method to get started.
          </p>
        </div>

        {/* Location Input Card */}
        <div className="w-full max-w-2xl">
          <div className="glass-card rounded-3xl p-8">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-white mb-2">Set Your Location</h2>
                <p className="text-gray-400">Choose how you'd like to share your location</p>
              </div>

              <div className="space-y-4">
                <GetUserLocation onLocation={handleLocation} />
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl border border-orange-500/10">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">GPS Accuracy</h3>
                    <p className="text-gray-400 text-sm">High precision location</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-slate-800/30 rounded-xl border border-blue-500/10">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <h3 className="text-white font-medium">IP Fallback</h3>
                    <p className="text-gray-400 text-sm">Alternative location method</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Display */}
          {coords && (
            <div className="mt-8 glass-card-navy rounded-3xl p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-white">Location Retrieved</h3>
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="text-orange-400 font-mono text-sm">
                      {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
                    </span>
                  </div>
                  {address && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-400">Address:</span>
                      <span className="text-white text-sm text-right max-w-xs">{address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              Your location data is processed securely and never stored permanently
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
