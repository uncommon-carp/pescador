import axios from 'axios';

export async function getZipCoords(location: string) {
  const key = process.env.MAPQUEST_API_KEY;
  console.log({ location });
  const response = await axios({
    method: 'get',
    url: `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${location}`,
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
