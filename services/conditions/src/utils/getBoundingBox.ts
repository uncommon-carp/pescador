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

export function getBoundingBox(lat: string | number, long: string | number, radius = 10) {
  const latNum = +lat;
  const longNum = +long;

  // Constants
  const MILES_PER_DEGREE_LAT = 69.172; // This is roughly constant

  // Calculate miles per degree of longitude at this latitude
  // This changes based on latitude (smaller as you approach poles)
  const latRadians = (latNum * Math.PI) / 180;
  const milesPerDegreeLong = Math.cos(latRadians) * MILES_PER_DEGREE_LAT;

  // Calculate degree offsets for the radius
  const latOffset = radius / MILES_PER_DEGREE_LAT;
  const longOffset = radius / milesPerDegreeLong;

  return {
    west: decimalTrim(longNum - longOffset),
    north: decimalTrim(latNum + latOffset),
    south: decimalTrim(latNum - latOffset),
    east: decimalTrim(longNum + longOffset),
  };
}
