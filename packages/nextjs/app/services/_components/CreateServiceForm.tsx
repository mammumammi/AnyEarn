"use client";

import React, { useState } from "react";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { parseEther } from "viem";
import GetUserLocation from "~~/components/GetUserLocation";

type Location = {
  lat: number;
  lon: number;
  address?: string;
};

interface Props {
  onServiceCreated: () => void;
}

const CreateServiceForm: React.FC<Props> = ({ onServiceCreated }) => {
  const { writeContractAsync: writeServiceManagerAsync } = useScaffoldWriteContract({
    contractName: "ServiceManager",
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reward: "",
    deadline: "",
  });

  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "start-location" | "end-location">("form");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = (coords: Location, address?: string) => {
    const location = { ...coords, address };
    if (step === "start-location") {
      setStartLocation(location);
      setStep("end-location");
    } else {
      setEndLocation(location);
      setStep("form");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!startLocation || !endLocation) {
        throw new Error("Please select both start and end locations");
      }

      const rewardInWei = parseEther(formData.reward);
      const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

      await writeServiceManagerAsync({
        functionName: "createService",
        args: [
          formData.title,
          formData.description,
          Math.round(startLocation.lat * 1000000), // Convert to int256 format
          Math.round(startLocation.lon * 1000000),
          startLocation.address || "",
          Math.round(endLocation.lat * 1000000),
          Math.round(endLocation.lon * 1000000),
          endLocation.address || "",
          deadlineTimestamp,
        ],
        value: rewardInWei,
      });

      // Reset form
      setFormData({ title: "", description: "", reward: "", deadline: "" });
      setStartLocation(null);
      setEndLocation(null);
      setStep("form");
      
      onServiceCreated();
    } catch (err: any) {
      console.error("Error creating service:", err);
      setError(err.message || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  if (step === "start-location") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Select Start Location</h3>
          <p className="text-gray-300 mb-6">Choose the starting point for your service.</p>
          <GetUserLocation onLocation={handleLocationSelect} />
          <button
            onClick={() => setStep("form")}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  if (step === "end-location") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-white mb-4">Select End Location</h3>
          <p className="text-gray-300 mb-6">Choose the destination for your service.</p>
          <GetUserLocation onLocation={handleLocationSelect} />
          <button
            onClick={() => setStep("start-location")}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Start Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Service Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter service title"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe what service you need"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="reward" className="block text-sm font-medium text-gray-300 mb-2">
                Reward (ETH) *
              </label>
              <input
                type="number"
                id="reward"
                name="reward"
                value={formData.reward}
                onChange={handleInputChange}
                required
                min="0"
                step="0.001"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.1"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-300 mb-2">
                Deadline *
              </label>
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
                min={getMinDate()}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Location</label>
              {startLocation ? (
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-white font-medium">
                    {startLocation.address || "Custom Location"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {startLocation.lat.toFixed(6)}, {startLocation.lon.toFixed(6)}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("start-location")}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-white hover:border-orange-500 transition-colors"
                >
                  Select Start Location
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Location</label>
              {endLocation ? (
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-white font-medium">
                    {endLocation.address || "Custom Location"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {endLocation.lat.toFixed(6)}, {endLocation.lon.toFixed(6)}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep("end-location")}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-white hover:border-orange-500 transition-colors"
                >
                  Select End Location
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !startLocation || !endLocation}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-300"
          >
            {loading ? "Creating Service..." : "Create Service"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceForm;
