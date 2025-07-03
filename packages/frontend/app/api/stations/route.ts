// File: app/api/stations/route.ts
import { NextResponse, type NextRequest } from 'next/server';

// This tells Next.js to treat this route as dynamic,
// preventing it from caching the response.
export const dynamic = 'force-dynamic';

/**
 * API route handler for fetching stations based on a zip code.
 * @param request The incoming Next.js request object.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipcode = searchParams.get('zipcode');

  // Validate the zip code parameter
  if (!zipcode || !/^\d{5}$/.test(zipcode)) {
    return NextResponse.json(
      { message: 'A valid 5-digit zipcode is required as a query parameter.' },
      { status: 400 }, // Bad Request
    );
  }

  try {
    // --- YOUR ACTUAL BACKEND LOGIC GOES HERE ---
    // This is where you would use the zipcode to call the Mapquest API,
    // then query your water data source with the resulting bounding box.
    // We'll use mock data to simulate a successful response.
    console.log(`Fetching stations for zip code: ${zipcode}`);

    // MOCK DATA - Replace this with your real API call
    const mockStations = [
      { id: '08158000', name: 'BARTON CR AT SH 71 NR OAK HILL, TX' },
      { id: '08155300', name: 'ONION CREEK AT US 183, AUSTIN, TX' },
      { id: '08156800', name: 'WILLIAMSON CREEK AT OAK HILLS, TX' },
      { id: '08157000', name: 'SLAUGHTER CREEK AT FM 1826 NR AUSTIN, TX' },
    ];
    // ------------------------------------------

    // Return the successful response with the station data
    return NextResponse.json(mockStations);
  } catch (error) {
    console.error('API Error:', error);
    // Return a generic server error response
    return NextResponse.json(
      { message: 'Failed to fetch station data due to a server error.' },
      { status: 500 }, // Internal Server Error
    );
  }
}
