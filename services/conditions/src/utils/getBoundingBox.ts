// We need to take a set of decimal degree coords and turn them into a bounding box
// that can be sent to USGS to collect all data sites within that box.

// convert decimal degrees to radians
// take cosine of radians and multiply by 69.172
// gives number of miles to one degree of longitude at given latitude

// USGS takes coords in order of west, north, south, east

function decimalTrim(num: number) {
  if (num.toString().split('.')[1].length > 7) {
    const [left, right] = num.toString().split('.');
    return left.concat('.', right.slice(0, 6));
  } else {
    return num;
  }
}

export function getBoundingBox(lat: string | number, long: string | number) {
  return {
    west: decimalTrim(+long - 0.2),
    north: decimalTrim(+lat + 0.2),
    south: decimalTrim(+lat - 0.2),
    east: decimalTrim(+long + 0.2),
  };
}
