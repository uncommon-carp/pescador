import axios from 'axios';
import {
  getBoundingBox,
  getLocationCoords,
  siteReducer,
  stationSort,
  parseLambdaEvent,
} from '../utils';
import { UsgsResponse, BulkStation, MultiLocationResponse, StationWithRange } from '@pescador/libs';

interface GetStationsByBoxInput {
  zip: string;
}

interface GetStationByIdInput {
  id: string;
  range: number;
}

interface GetStationsFuzzyInput {
  userInput: string;
  radius?: number;
}

const url = 'http://waterservices.usgs.gov/nwis/iv';

export const getStationsByBox = async (
  event: any,
): Promise<BulkStation> => {
  const input = parseLambdaEvent<GetStationsByBoxInput>(event, 'zip');
  const { zip } = input;

  if (!zip) {
    throw new Error('Zip code is required but was undefined');
  }
  const { lat, lng } = await getLocationCoords(zip);
  const { west, north, south, east } = getBoundingBox(lat, lng);
  const params = {
    format: 'json',
    bBox: `${west},${south},${east},${north}`,
    parameterCd: '00060,00065',
    siteStatus: 'active',
    siteType: 'LK,ST',
  };
  try {
    const response = await axios<UsgsResponse>({
      method: 'get',
      url,
      params,
    });
    return siteReducer(response.data.value.timeSeries);
  } catch (err) {
    if (err instanceof Error) throw new Error(`${err.message}`);
    throw new Error('Internal Server Error');
  }
};

export const getStationById = async (
  event: any,
): Promise<StationWithRange> => {
  const input = parseLambdaEvent<GetStationByIdInput>(event, 'id');
  const { id, range } = input;
  const params = {
    format: 'json',
    sites: id,
    siteStatus: 'active',
    period: `P${range}D`,
  };

  try {
    const resp = await axios<UsgsResponse>({
      method: 'get',
      url,
      params,
    });

    return {
      name: resp.data.value.timeSeries[0].sourceInfo.siteName,
      usgsId: resp.data.value.timeSeries[0].sourceInfo.siteCode[0].value,
      lat: resp.data.value.timeSeries[0].sourceInfo.geoLocation.geogLocation
        .latitude,
      lon: resp.data.value.timeSeries[0].sourceInfo.geoLocation.geogLocation
        .longitude,
      values: stationSort(resp.data.value.timeSeries),
    };
  } catch (err) {
    throw new Error('41f675c9-da49-4986-b668-0d2b1e9b0c50');
  }
};

export const getStationFuzzy = async (event: any): Promise<BulkStation | MultiLocationResponse> => {
  const input = parseLambdaEvent<GetStationsFuzzyInput>(event, 'userInput');

  // send input to MapQuest
  console.log('Sending input to MapQuest:', input);
  const result = await getLocationCoords(input.userInput);

  if (result.type === 'opt') {
    console.log('Multiple location response:', result);
    return result;
  }
  // if single result
  if (result.type === 'loc') {
    console.log('Single result');
    const radius = input.radius || 10; // Default to 10 miles if not provided
    const { west, north, south, east } = getBoundingBox(result.lat, result.lng, radius);

    const params = {
      format: 'json',
      bBox: `${west},${south},${east},${north}`,
      parameterCd: '00060,00065',
      siteStatus: 'active',
      siteType: 'LK,ST',
    };
    try {
      const response = await axios<UsgsResponse>({
        method: 'get',
        url,
        params,
      });
      console.log('USGS Response:', response);
      return siteReducer(response.data.value.timeSeries);
    } catch (err) {
      console.log(err);
      if (err instanceof Error) throw new Error(`${err.message}`);
      throw new Error('Internal Server Error');
    }

  }
  // No results found - return empty MultiLocationResponse structure
  return { type: 'ftf', options: [] };
};
