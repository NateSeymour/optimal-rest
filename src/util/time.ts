import tc from 'timezonecomplete';

export const timestampTimeOnlyMs = (timestamp: number): number => {
  return timestamp % tc.days(1).milliseconds();
};

export const timestampFlatten = (timestamp: number): number => {
  return timestamp - timestampTimeOnlyMs(timestamp);
};
