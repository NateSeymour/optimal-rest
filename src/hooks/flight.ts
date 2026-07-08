import { computed, toValue, type ComputedRef, type Ref } from 'vue';
import { distanceTo, headingTo, normalizeHeading } from 'geolocation-utils';
import tc, { Duration } from 'timezonecomplete';
import airports from '../data/airports.json';

export interface Flight {
  id: string;
  day: number,
  departure: string,
  origin: string, 
  destination: string, 
};

export interface Airport {
  name: string,
  iata: string,
  icao: string,
  lat: number,
  lon: number,
  mun: string,
  tz: string,
};

export interface ResolvedFlight {
  day: number,
  departure: string,
  origin: Airport,
  destination: Airport,
  distance: number,
  heading: number,
  flightTime: Duration,
};

export const useAirportAutocomplete = (iata: Ref<string> | string) => {
  const input = toValue(iata).toUpperCase();
  
  return airports.iata.filter(code => code.includes(input))
    .map(code => ({
      label: code,
      value: code,
    }));
};

export const getAirport = (iata?: string): Airport | null => {
  // @ts-ignore
  return airports.by_iata[iata.toUpperCase()] || null;
};

export const useAirport = (iata?: Ref<string>): ComputedRef<Airport | null> => {
  return computed(() => getAirport(toValue(iata)));
};

export const calculateDistance = (a: Airport | null, b: Airport | null): number => {
  if(a && b) {
    return Math.round(distanceTo(a, b) * 0.000621371);
  }

  return 0;
};

export const useDistance = (a: Ref<Airport | null> | Airport, b: Ref<Airport | null>): ComputedRef<number> => {
  return computed(() => calculateDistance(toValue(a), toValue(b)));
};

export const calculateHeading = (a: Airport | null, b: Airport | null): number => {
  if(a && b) {
    return Math.round(normalizeHeading(headingTo(a, b)));
  }

  return 0;
};

export const useHeading = (a: Ref<Airport | null>, b: Ref<Airport | null>): ComputedRef<number> => {
  return computed(() => calculateHeading(toValue(a), toValue(b)));
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

export const useFlightTime = (a: Ref<Airport | null>, b: Ref<Airport | null>): ComputedRef<Duration> => {
  return computed(() => calculateFlightTime(toValue(a), toValue(b)));
};

export const resolveFlight = (flight: Flight): ResolvedFlight => {
  const origin = getAirport(flight.origin);
  const destination = getAirport(flight.destination);

  if(!origin || !destination) {
    throw new Error('Origin or destination do not exist!');
  }

  return {
    ...flight,

    origin,
    destination,

    distance: calculateDistance(origin, destination),
    heading: calculateHeading(origin, destination),
    flightTime: calculateFlightTime(origin, destination),
  };
};

export const useResolvedFlights = (flights: Ref<Flight[]>) => {
  return computed(() => flights.value.map(resolveFlight));
};

export const useFlight = (originCode: Ref<string>, destinationCode: Ref<string>) => {
  const origin = useAirport(originCode);
  const destination = useAirport(destinationCode);

  return {
    origin,
    destination,

    distance: useDistance(origin, destination),
    heading: useHeading(origin, destination),
    flightTime: useFlightTime(origin, destination),
  };
};

export const useSequenceStats = (flights: Ref<ResolvedFlight[]>) => {
  const totalDays = computed(() => {
    return flights.value.reduce((acc, current) => Math.max(acc, current.day), 1);
  });

  const totalDistance = computed(() => {
    return flights.value.reduce((acc, current) => acc + current.distance, 0);
  });

  const totalFlightTime = computed(() => {
    return flights.value.reduce((acc, current) => acc.add(current.flightTime as Duration), tc.hours(0));
  });

  return { totalDays, totalDistance, totalFlightTime };
};