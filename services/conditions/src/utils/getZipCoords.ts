import axios from 'axios';

export async function getZipCoords(location: string) {
  const key = process.env.MAPQUEST_API_KEY;

  const response = await axios({
    method: 'get',
    url: `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${location}`,
  });

  if (response.data.info.statusCode === 400) {
    throw new Error('Invalid query for coordinates');
  }

  const lat = response.data.results[0].locations[0].latLng.lat;
  const lng = response.data.results[0].locations[0].latLng.lng;

  return { lat, lng };
}
