"use client";

import React, { useState } from "react";
import { Service } from "../page";

interface Props {
  service: Service;
  onClose: () => void;
}

const NavigationHelper: React.FC<Props> = ({ service, onClose }) => {
  const [currentStep, setCurrentStep] = useState<"start" | "end">("start");

  const formatCoordinates = (lat: bigint, lon: bigint) => {
    const latNum = Number(lat) / 1000000;
    const lonNum = Number(lon) / 1000000;
    return `${latNum.toFixed(6)}, ${lonNum.toFixed(6)}`;
  };

  const openInMaps = (lat: bigint, lon: bigint, label: string) => {
    const latNum = Number(lat) / 1000000;
    const lonNum = Number(lon) / 1000000;
    
    // Try to open in Google Maps first, fallback to Apple Maps
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latNum},${lonNum}&travelmode=driving`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${latNum},${lonNum}&dirflg=d`;
    
    // Detect if user is on iOS/macOS
    const isApple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
    const mapsUrl = isApple ? appleMapsUrl : googleMapsUrl;
    
    window.open(mapsUrl, '_blank');
  };

  const copyCoordinates = (lat: bigint, lon: bigint) => {
    const coords = formatCoordinates(lat, lon);
    navigator.clipboard.writeText(coords);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Navigation Guide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Service Info */}
        <div className="mb-6 p-4 bg-slate-700 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-2">{service.title}</h3>
          <p className="text-gray-300 text-sm mb-2">Reward: {Number(service.reward) / 1e18} ETH</p>
          <p className="text-gray-300 text-sm">Deadline: {new Date(Number(service.deadline) * 1000).toLocaleDateString()}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center space-x-2 ${currentStep === 'start' ? 'text-orange-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'start' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                1
              </div>
              <span className="font-medium">Start Location</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep === 'end' ? 'text-orange-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'end' ? 'bg-orange-500 text-white' : 'bg-gray-600 text-gray-300'
              }`}>
                2
              </div>
              <span className="font-medium">End Location</span>
            </div>
          </div>
        </div>

        {/* Current Location Details */}
        {currentStep === 'start' ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-white mb-2">📍 Start Location</h4>
              <p className="text-gray-300 mb-2">{service.startLocation.locationAddress || "Custom Location"}</p>
              <p className="text-sm text-gray-400 mb-4">
                Coordinates: {formatCoordinates(service.startLocation.latitude, service.startLocation.longitude)}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => openInMaps(service.startLocation.latitude, service.startLocation.longitude, "Start Location")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Open in Maps</span>
              </button>
              
              <button
                onClick={() => copyCoordinates(service.startLocation.latitude, service.startLocation.longitude)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Coordinates</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-white mb-2">🎯 End Location</h4>
              <p className="text-gray-300 mb-2">{service.endLocation.locationAddress || "Custom Location"}</p>
              <p className="text-sm text-gray-400 mb-4">
                Coordinates: {formatCoordinates(service.endLocation.latitude, service.endLocation.longitude)}
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => openInMaps(service.endLocation.latitude, service.endLocation.longitude, "End Location")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Open in Maps</span>
              </button>
              
              <button
                onClick={() => copyCoordinates(service.endLocation.latitude, service.endLocation.longitude)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy Coordinates</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex space-x-3 mt-6">
          {currentStep === 'start' ? (
            <button
              onClick={() => setCurrentStep('end')}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Next: End Location
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep('start')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-300"
            >
              Back: Start Location
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h5 className="text-blue-400 font-medium mb-2">Instructions:</h5>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>1. Navigate to the start location</li>
            <li>2. Complete the service task</li>
            <li>3. Navigate to the end location</li>
            <li>4. Mark the service as completed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavigationHelper;
