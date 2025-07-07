export const convertMmHgToInHg = (mmHg: number): string => {
  if (typeof mmHg !== 'number') return '';
  const inHg = mmHg * 0.0393701;
  return inHg.toFixed(2);
};
