export interface UsgsResponse {
  value: {
    timeSeries: TimeSerial[];
  };
}

export interface TimeSerial {
  sourceInfo: SourceInfo;
  variable: UsgsVariableField;
  values: UsgsValueField[];
}

export interface UsgsValueField {
  value: UsgsValue[];
}

export interface UsgsValue {
  value: string;
  dateTime: string;
}

export interface UsgsVariableField {
  variableCode: UsgsVariable[];
  variableName: string;
}

export interface UsgsVariable {
  value: string;
}

export interface SourceInfo {
  siteName: string;
  siteCode: [
    {
      value: string;
      agencyCode: string;
    },
  ];
  geoLocation: {
    geogLocation: {
      latitude: number;
      longitude: number;
    };
  };
  siteProperty: [
    {
      value: string;
      name: string;
    },
  ];
}

export interface OpenWeatherResponse {
  lat: number;
  lon: number;
  current?: CurrentWeather;
  minutely?: [MinutelyWeather];
  hourly?: [CurrentWeather];
}

export interface CurrentWeather {
  sunrise: number;
  sunset: number;
  temp: number;
  pressure: number;
  humidity: number;
  clouds: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: [WeatherDescription];
}

export interface WeatherDescription {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface MinutelyWeather {
  dt: number;
  precipitation: number;
}
