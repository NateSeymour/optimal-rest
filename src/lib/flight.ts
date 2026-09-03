import {type Ref, toValue} from 'vue';
import type {Duration} from 'timezonecomplete';
import type {Maybe} from '../util/maybe.ts';
import {type Airport, calculateDistance, calculateFlightTime, calculateHeading, getAirport} from './airport.ts';

export interface Flight {
  period: number;
  callsign: string;
  departure: string;
  originCode: string;
  destinationCode: string;
}

export interface ResolvedFlight extends Flight {
  origin: Airport;
  destination: Airport;
  distance: number;
  heading: number;
  duration: Duration;
}

export const resolveFlight = (flight: Flight): ResolvedFlight => {
  const origin = getAirport(flight.originCode);
  const destination = getAirport(flight.destinationCode);

  if(!origin || !destination) {
    throw new Error('Origin or destination do not exist!');
  }

  return {
    ...flight,

    origin,
    destination,

    distance: calculateDistance(origin, destination),
    heading: calculateHeading(origin, destination),
    duration: calculateFlightTime(origin, destination),
  };
};