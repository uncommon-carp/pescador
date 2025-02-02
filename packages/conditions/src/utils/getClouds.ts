export function getClouds(cloudiness: number): string {
  if (cloudiness === 0) return 'Clear skies';
  if (cloudiness <= 25) return 'Mostly sunny';
  if (cloudiness <= 50) return 'Partly cloudy';
  if (cloudiness <= 75) return 'Mostly cloudy';
  return 'Overcast';
}
