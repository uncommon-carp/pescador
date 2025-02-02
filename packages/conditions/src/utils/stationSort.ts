import { TimeSerial, DataFrame, ReportedValues } from '@pescador/interfaces';
// Functionality for sorting and paring down USGS site requests time series
// The data received for each type of site is different dependent on whether it is
// is a stream or lake.

function streamSort(data: TimeSerial[]) {
  // This is the data format we want on the client
  const sorted: ReportedValues = {
    __typename: 'ReportedValues',
    gage: [],
    flow: [],
  };
  // We want to limit the data arrays to 30ish points for 3 days of data
  // Find integer needed to pare data
  const interval = Math.floor(data[0].values[0].value.length / 30);
  // For each value at interval, add a new object to the corresponding array
  data.forEach((obj) => {
    obj.values[0].value.forEach((value, i) => {
      if (i === 0 || i % interval === 0) {
        const newObject: DataFrame = {
          __typename: 'DataFrame',
          timestamp: value.dateTime,
          value: Number(value.value),
        };
        if (obj.variable.variableCode[0].value === '00060') {
          sorted.flow!.push(newObject);
        } else if (obj.variable.variableCode[0].value === '00065') {
          sorted.gage!.push(newObject);
        }
      }
    });
  });

  return sorted;
}

function lakeSort(data: TimeSerial[]): ReportedValues {
  const sorted: ReportedValues = {
    __typename: 'ReportedValues',
    gage: [],
  };

  const interval = Math.floor(data[0].values[0].value.length / 30);

  data[0].values[0].value.forEach((value, i) => {
    if (i === 0 || i % interval === 0) {
      const newObject: DataFrame = {
        __typename: 'DataFrame',
        timestamp: value.dateTime,
        value: Number(value.value),
      };
      sorted.gage!.push(newObject);
    }
  });
  return sorted;
}

export function stationSort(data: TimeSerial[]): ReportedValues {
  if (data[0].sourceInfo.siteProperty[0].value === 'ST') {
    return streamSort(data);
  } else {
    return lakeSort(data);
  }
}
