import axios from 'axios';
import {
  getBoundingBox,
  getZipCoords,
  siteReducer,
  stationSort,
} from '../utils';
import { UsgsResponse, BulkStation, StationWithRange } from '@pescador/libs';

interface GetStationsByBoxInput {
  zip: string;
}

interface GetStationByIdInput {
  id: string;
  range: number;
}

interface LambdaEvent {
  body: string;
}

const url = 'http://waterservices.usgs.gov/nwis/iv';

export const getStationsByBox = async (
  event: any,
): Promise<BulkStation> => {
  // Parse event.body if it's a Lambda event, otherwise use input directly
  let input: GetStationsByBoxInput;
  if (event.body && typeof event.body === 'string') {
    input = JSON.parse(event.body);
  } else if (event.body && typeof event.body === 'object') {
    input = event.body;
  } else if (event.zip) {
    input = event;
  } else {
    throw new Error('Invalid event format - no zip code found');
  }

  const { zip } = input;

  if (!zip) {
    throw new Error('Zip code is required but was undefined');
  }
  const { lat, lng } = await getZipCoords(zip);
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
  // Parse event.body if it's a Lambda event, otherwise use input directly
  let input: GetStationByIdInput;
  if (event.body && typeof event.body === 'string') {
    input = JSON.parse(event.body);
  } else if (event.body && typeof event.body === 'object') {
    input = event.body;
  } else if (event.id) {
    input = event;
  } else {
    throw new Error('Invalid event format - no id found');
  }

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
