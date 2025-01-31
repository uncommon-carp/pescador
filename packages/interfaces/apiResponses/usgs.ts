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
