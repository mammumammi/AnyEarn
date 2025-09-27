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
    <div>
      <h1>Food Delivery App</h1>
      <GetUserLocation onLocation={handleLocation} />
      {coords && (
        <div>
          <p>
            Coordinates: {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </p>
          {address && <p>Address: {address}</p>}
        </div>
      )}
    </div>
  );
}
