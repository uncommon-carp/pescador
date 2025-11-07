import axios from 'axios';

export async function getZipCoords(location: string) {
  const key = process.env.MAPQUEST_API_KEY;
  console.log('getZipCoords - Input location:', location);
  console.log('getZipCoords - Location type:', typeof location);
  console.log('getZipCoords - Location is undefined?', location === undefined);

  const response = await axios({
    method: 'get',
    url: `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${location}`,
  });

  console.log('getZipCoords - Full response:', JSON.stringify(response.data));

  if (response.data.info.statusCode === 400) {
    throw new Error('Invalid query for coordinates');
  }

  const lat = response.data.results[0].locations[0].latLng.lat;
  const lng = response.data.results[0].locations[0].latLng.lng;

  console.log('getZipCoords - Returning coordinates:', { lat, lng });

  return { lat, lng };
}
