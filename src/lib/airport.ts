import rawAirports from '../data/airports.json';
import {computed, type ComputedRef, type Ref, toValue} from 'vue';
import {distanceTo, headingTo, normalizeHeading} from 'geolocation-utils';
import tc, {Duration} from 'timezonecomplete';

export interface Airport {
  name: string,
  iata: string,
  icao: string,
  lat: number,
  lon: number,
  mun: string,
  tz: string,
}

export const airports : Record<string, Airport> = rawAirports.by_iata;

export const getAirport = (iata: string): Airport | null => {
  return airports[iata.toUpperCase()] || null;
};

export const queryAirports = (term: string) => {
  const input = term.toUpperCase();

  return Object.values(airports).filter(airport => {
    return airport.iata.includes(input) || airport.icao.includes(input);
  })
    .map(airport => ({
      label: airport.iata,
      value: airport.iata,
    }));
};

export const calculateDistance = (a: Airport | null, b: Airport | null): number => {
  if(a && b) {
    return Math.round(distanceTo(a, b) * 0.000621371);
  }

  return 0;
};

export const calculateHeading = (a: Airport | null, b: Airport | null): number => {
  if(a && b) {
    return Math.round(normalizeHeading(headingTo(a, b)));
  }

  return 0;
};

export const calculateFlightTime = (a: Airport | null, b: Airport | null): Duration => {
  const distance = calculateDistance(a, b);
  const heading = calculateHeading(a, b);

  if(distance === 0) return tc.hours(0);

  let flightSpeed = 550; // mph ground speed

  // If flying mostly west, slow down a bit
  if(heading > 200 && heading < 340) {
    flightSpeed -= 50;
  }

  return tc.hours(distance / flightSpeed);
};
