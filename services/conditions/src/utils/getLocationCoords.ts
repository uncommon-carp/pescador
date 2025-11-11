import axios from 'axios';

interface MapQuestLocation {
  adminArea5: string;  // City
  adminArea4: string;  // County
  adminArea3: string;  // State
  latLng: {
    lat: number;
    lng: number;
  };
};

export async function getLocationCoords(location: string) {
  const key = process.env.MAPQUEST_API_KEY;

  const response = await axios({
    method: 'get',
    url: `http://www.mapquestapi.com/geocoding/v1/address?key=${key}&location=${location}`,
  });

  if (response.data.info.statusCode === 400) {
    throw new Error('Invalid query');
  }

  if (response.data.results[0].locations.length > 1) {
    const options = response.data.results[0].locations.map((loc: MapQuestLocation) => ({
      display: `${loc.adminArea5}, ${loc.adminArea3} (${loc.adminArea4})`,
      lat: loc.latLng.lat,
      lon: loc.latLng.lng,
      county: loc.adminArea4
    }));

    return { type: 'opt', options };
  }

  const lat = response.data.results[0].locations[0].latLng.lat;
  const lng = response.data.results[0].locations[0].latLng.lng;

  return { type: 'loc', lat, lng };
}
