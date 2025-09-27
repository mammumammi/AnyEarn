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
        <div>
            <button onClick={getBrowserGeo} disabled={loading} className="bg-amber-600 border-4 rounded-md">Use GPS</button>

            <button onClick={getIpGeoFallback} disabled={loading}>Use IP address tracking</button>
            {loading && <p>Getting location…</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )


}

export default GetUserLocation;