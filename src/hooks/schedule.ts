import type { Ref } from "vue";
import tc, {DateTime, type Duration} from 'timezonecomplete';
import type {ResolvedFlight} from "./flight.ts";

export interface OptimizedRestScheduleOptions {
  start: Ref<string>,
  wake: Ref<string>,
};

class Event {
  title: string;
  start: DateTime;
  duration: Duration;

  constructor(opts: { title: string, duration: Duration, start?: DateTime, before?: Event, after?: Event, tz?: string }) {
    this.title = opts.title;
    this.duration = opts.duration;

    if(opts.start) {
      this.start = opts.start;
    }
    else if(opts.before && opts.duration) {
      this.start = opts.before.start.sub(opts.duration);
    }
    else if(opts.after) {
      this.start = opts.after.start.add(opts.after.duration);
    } else {
      throw new Error('Must provided an orientation for the event!');
    }

    if(opts.tz) {
      this.start = this.start.convert(tc.zone(opts.tz));
    }
  }
};

const timeFormat = 'MM/dd HH:mm OOOO';

export const useOptimizedRestSchedule = (flights: Ref<ResolvedFlight[]>, opts: OptimizedRestScheduleOptions) => {
  const totalDays = flights.value.reduce((acc, current) => Math.max(acc, current.day), 0);

  const events: Event[] = [];
  const sequenceStartDate = new tc.DateTime(opts.start.value, tc.zone(flights.value[0].origin.tz));

  for(const flight of flights.value) {
    const departureDay = sequenceStartDate.add(tc.days(flight.day));
    const departureTime = departureDay.add(new tc.Duration(flight.departure));

    const departure = new Event({
      title: `Departure to ${flight.destination.mun}`,
      start: departureTime,
      duration: flight.flightTime,
    });

    const signIn = new Event({
      title: `Sign in for flight to ${flight.destination.mun}`,
      before: departure,
      duration: new tc.Duration("01:15"),
    });

    const transportation = new Event({
      title: `Leave for ${flight.origin.iata}`,
      before: signIn,
      duration: new tc.Duration("01:15"),
    });

    const prepare = new Event({
      title: `Prepare for flight to ${flight.destination.mun}`,
      before: transportation,
      duration: tc.hours(1),
    });

    const arrival = new Event({
      title: `Arrival in ${flight.destination.mun}`,
      after: departure,
      duration: tc.hours(1),
      tz: flight.destination.tz,
    });

    events.push(prepare, transportation, signIn, departure, arrival);
  }

  events.sort((a, b) => a.start.unixUtcMillis() - b.start.unixUtcMillis());

  const schedule = events.map((event) => ({
    content: event.title,
    time: event.start.format(timeFormat),
  }));

  const scheduledTime = events.reduce((acc, current) => acc.add(current.duration), tc.hours(0));
  const unscheduledTime = tc.days(totalDays).sub(scheduledTime);

  return {
    schedule,
    scheduledTime,
    unscheduledTime,
  };
};