import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userLat, userLon, serviceLat, serviceLon } = await request.json();

    if (!userLat || !userLon || !serviceLat || !serviceLon) {
      return NextResponse.json(
        { error: 'Missing required coordinates' },
        { status: 400 }
      );
    }

    // Use Mapbox Matrix API for distance calculation
    const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxAccessToken) {
      // Fallback to simple distance calculation if Mapbox token is not available
      const distance = calculateDistance(userLat, userLon, serviceLat, serviceLon);
      return NextResponse.json({ distance: distance.toFixed(2) });
    }

    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${userLon},${userLat};${serviceLon},${serviceLat}?sources=0&destinations=1&access_token=${mapboxAccessToken}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      // Fallback to simple distance calculation
      const distance = calculateDistance(userLat, userLon, serviceLat, serviceLon);
      return NextResponse.json({ distance: distance.toFixed(2) });
    }

    const distance = data.distances[0][0] / 1000; // Convert from meters to kilometers
    return NextResponse.json({ distance: distance.toFixed(2) });

  } catch (error) {
    console.error('Distance calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}

// Haversine formula for calculating distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
