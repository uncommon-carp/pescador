import axios from 'axios';

export async function getZipCoords(postalCode: string) {
  const key = process.env.MAPQUEST_API_KEY;
  const params = { key, postalCode };
  const response = await axios({
    method: 'get',
    url: 'http://www.mapquestapi.com/geocoding/v1/address',
    params,
  });
  console.log(JSON.stringify(response.data.results));
  if (response.data.info.statusCode === 400) {
    throw new Error('Invalid query for coordinates');
  }
  return {
    lat: response.data.results[0].locations[0].latLng.lat,
    lng: response.data.results[0].locations[0].latLng.lng,
  };
}
