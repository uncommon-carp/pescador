import { DisplayUnits } from '../../../../libs/interfaces/graph/types.generated';

/**
 * Converts GraphQL DisplayUnits enum to service string format
 */
export const convertDisplayUnitsToService = (
  units?: DisplayUnits | null
): 'metric' | 'imperial' | undefined => {
  if (!units) return undefined;
  return units === DisplayUnits.Metric ? 'metric' : 'imperial';
};

/**
 * Converts service DisplayUnits string to GraphQL enum
 */
export const convertDisplayUnitsToGraphQL = (
  units?: 'metric' | 'imperial'
): DisplayUnits | null => {
  if (!units) return null;
  return units === 'metric' ? DisplayUnits.Metric : DisplayUnits.Imperial;
};
