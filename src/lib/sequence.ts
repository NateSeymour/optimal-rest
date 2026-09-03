import {type Flight, type ResolvedFlight, resolveFlight} from './flight.ts';

export interface Sequence {
  number: number;
  flights: ResolvedFlight[];
}

export const loadSequence = (key: string) : Sequence | null => {
  const sequence = JSON.parse(localStorage.getItem(key) || 'null');
  if(!sequence) return null;

  return {
    number: sequence.number,
    flights: sequence.flights.map(([, flight]: [string, Flight]) => resolveFlight(flight)),
  };
};
