import { gql } from '@apollo/client';

export const GET_STATION_QUERY = gql`
  query GetStation($id: String!, $range: Int!) {
    station(id: $id, range: $range) {
      usgsId
      name
      lat
      lon
      values {
        flow {
          value
          timestamp
        }
        gage {
          value
          timestamp
        }
      }
    }
  }
`;

export const GET_WEATHER_QUERY = gql`
  query GetWeather($zip: String!) {
    weather(zip: $zip) {
      temp
      wind {
        speed
        direction
        gust
      }
      pressure
      humidity
      clouds
    }
  }
`;

export const SEARCH_STATIONS_QUERY = gql`
  query SearchStations($zip: String!) {
    bulkStation(zip: $zip) {
      lakes {
        usgsId
        name
        flowRate
        gageHt
        lat
        lon
      }
      streams {
        usgsId
        name
        flowRate
        gageHt
        lat
        lon
      }
    }
  }
`;
