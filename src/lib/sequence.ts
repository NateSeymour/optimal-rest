import {type Flight, type ResolvedFlight, resolveFlight} from './flight.ts';

export interface Sequence {
  number: number;
  date: string;
  flights: ResolvedFlight[];
}

export const loadSequence = (key: string, date: string) => {
  const sequence = JSON.parse(localStorage.getItem(key) || 'null');
  if(!sequence) return null;

  return {
    number: sequence.number,
    date,
    flights: sequence.flights.map(([, flight]: [string, Flight]) => resolveFlight(flight)),
  };
};
