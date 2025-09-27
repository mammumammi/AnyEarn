"use client";

import { useState } from "react";
import axios from "axios";
export type Coordinates = { lat:number; lon:number};

interface Props {
    onLocation: (coords: Coordinates, address?: string) => void;
}

const GetUserLocation: React.FC<Props> = ({onLocation}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [ error,setError] = useState<string | null>(null);

    const getBrowserGeo = async (): Promise<void> => {
        setError(null);
        if (!navigator.geolocation){
            setError("Geolocation not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition( async (pos) => {
            setLoading(false);
            const coords: Coordinates = {
                lat : pos.coords.latitude,
                lon : pos.coords.longitude
            };

            try{
                const {data} = await axios.post("/api/reverse-geocode",coords);
                onLocation(coords,data.address ?? undefined);
            }
            catch( err){
                console.error("Error in getting location:",err);
                onLocation(coords);
            }
        },
    (err) => {
        setLoading(false);
        setError(err.message|| "unable to get location");
    },{
        enableHighAccuracy: true,timeout: 10000,maximumAge:0
    }
    );
    };

    const getIpGeoFallback = async () => {
        setError(null);
        setLoading(true);

        try{
            const {data} = await axios.get("https://ipapi.json");
            setLoading(false);

            if (data.latitude && data.longitude) {
                const coords: Coordinates = { lat:Number(data.latitude), lon:Number(data.longitude)};
                const address = data.city ? `${data.city}, ${data.region}, ${data.country_name}` : undefined;
                onLocation(coords,address); 
            }
            else {
                setError("IP based Geo Location Failed");
            }
        }
        catch (err) {
            setLoading(false);
            console.error("An error occured when retriving the geo location:",err);

        }
    }

    return(
        <div className="space-y-4">
            {/* GPS Button */}
            <button 
                onClick={getBrowserGeo} 
                disabled={loading} 
                className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-700 disabled:to-gray-800 text-black px-6 py-4 rounded-xl transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-green-500/30"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{loading ? "Getting GPS location..." : "Use GPS Location"}</span>
            </button>

            {/* IP Fallback Button */}
            <button 
                onClick={getIpGeoFallback} 
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-black border-2 border-green-500 hover:bg-green-500 hover:text-black disabled:bg-gray-800 disabled:border-gray-600 text-green-500 px-6 py-4 rounded-xl transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                <span>{loading ? "Getting IP location..." : "Use IP Address"}</span>
            </button>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center space-x-2 text-green-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                    <span className="text-sm">Getting location…</span>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
            )}
        </div>
    )


}

export default GetUserLocation;