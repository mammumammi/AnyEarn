import axios from "axios";
import type { NextApiRequest,NextApiResponse } from "next";

type GeoRequestBody = {lat:number; lon:number};
type IpRequestBody = {address?: string; raw?: any;error?:string};

export default async function handler(req: NextApiRequest,res: NextApiResponse<GeoResponse>) {
    if (req.method != "POST") return res.status(405).json({error:"Lattitude and Longitude required"});

    const {lat,lon} = req.body as GeoRequestBody;
    if (!lat || !lon) return res.status(400).json({error: "LAtitude or langitude isnt given"});

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({error:"Missing API Key"});

    try {
        const {data} = await axios.get(
           `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`
        );

        const address =  data.results?.[0]?.formatted_address ?? null;
        res.status(200).json({address,raw:data});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error:"Reverse geocdoe is faling" 
            });   
             }

}