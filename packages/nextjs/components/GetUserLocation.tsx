"use client";

import { useState } from "react";

export type Coordinates = { lat:number; lon:number};

interface Props {
    onLocation: (coords: Coordinates, address?: string) => void;
}

const GetUserLocation: React.FC<Props> = ({onLocation}) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [ error,setError] = useState<string | null>(null);

    const GetBrowserGeo = async (): Promise<void> => {
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
                const res = await fetch("api/reverse-geocode,");
            }
        })
    }


}

