import {computed, type Ref} from "vue";
import tc, {DateTime, type Duration} from 'timezonecomplete';
import type {ResolvedFlight} from "./flight.ts";

export interface OptimizedRestScheduleOptions {
  start: Ref<string>,
  wake: Ref<string>,
}

class Event {
  title: string;
  start: DateTime;
  end: DateTime;
  duration: Duration;

  constructor(opts: { title: string, duration: Duration, start?: DateTime, before?: Event, after?: Event, tz?: string, endTz?: string }) {
    this.title = opts.title;
    this.duration = opts.duration;

    if(opts.start) {
      this.start = opts.start;
    }
    else if(opts.before && opts.duration) {
      this.start = opts.before.start.sub(opts.duration);
    }
    else if(opts.after) {
      this.start = opts.after.end;
    } else {
      throw new Error('Must provided an orientation for the event!');
    }

    if(opts.tz) {
      this.start = this.start.convert(tc.zone(opts.tz));
    }

    this.end = this.start.add(this.duration);

    if(opts.endTz) {
      this.end = this.end.convert(tc.zone(opts.endTz));
    }
  }
}

interface Layover {
  location: string,
  startsAfter?: Event,
  endsBefore?: Event,
}

export const useOptimizedRestSchedule = (flights: Ref<ResolvedFlight[]>, opts: OptimizedRestScheduleOptions) => {
  return computed(() => {
    const events: Event[] = [];
    const sequenceStartDate = new tc.DateTime(opts.start.value, tc.zone(flights.value[0].origin.tz));

    const firstDay = flights.value.reduce((acc, current) => Math.min(acc, current.day), 100);
    const lastDay = flights.value.reduce((acc, current) => Math.max(acc, current.day), 0);

    const days = Object.groupBy(flights.value, ({day}) => day);
    const layovers: Layover[] = [];

    for(const [y, flights] of Object.values(days).entries()) {
      const day = parseInt(Object.keys(days)[y]);

      if(day === firstDay) {
        events.push(new Event({
          title: 'Sleep',
          start: sequenceStartDate,
          duration: new tc.Duration(opts.wake.value),
        }));
      }

      for(const [i, flight] of flights!.entries()) {
        const dayStart = new tc.DateTime(opts.start.value, tc.zone(flight.origin.tz));
        const departureDay = dayStart.add(tc.days(flight.day - 1));
        const departureTime = departureDay.add(new tc.Duration(flight.departure));

        const isFirstFlightOfDay = i === 0;
        const isLastFlightOfDay = i === flights!.length - 1;

        const flightEvent = new Event({
          title: `Flight to ${flight.destination.mun}`,
          start: departureTime,
          duration: flight.flightTime,
          tz: flight.origin.tz,
          endTz: flight.destination.tz,
        });

        const preDeparture = new Event({
          title: `Pre-Departure`,
          before: flightEvent,
          duration: new tc.Duration("01:15"),
        });

        events.push(preDeparture, flightEvent);

        if(isFirstFlightOfDay) {
          const transportation = new Event({
            title: `Transportation to ${flight.origin.iata}`,
            before: preDeparture,
            duration: new tc.Duration("01:15"),
          });

          const prepare = new Event({
            title: `Preparation for Duty`,
            before: transportation,
            duration: tc.hours(1),
          });

          if(layovers.length > 0) {
            layovers[layovers.length - 1].endsBefore = prepare;
          }

          events.push(transportation, prepare);
        }

        if(isLastFlightOfDay) {
          const debrief = new Event({
            title: `Debrief`,
            after: flightEvent,
            duration: tc.hours(1),
          });

          layovers.push({ location: flight.destination.mun, startsAfter: debrief });

          events.push(debrief);
        }
      }
    }

    for(const {location, startsAfter, endsBefore} of layovers) {
      if(startsAfter && endsBefore) {
        events.push(new Event({
          title: `Layover in ${location}`,
          after: startsAfter,
          duration: endsBefore.start.diff(startsAfter.end),
        }));
      }
    }

    events.sort((a, b) => a.start.unixUtcMillis() - b.start.unixUtcMillis());

    const timeFormat = 'HH:mm';
    const timelineEvents = events.map((event) => ({
      content: event.title,
      time: `${event.start.format(timeFormat)} - ${event.end.format(timeFormat)}`,
    }));

    const scheduledTime = events.reduce((acc, current) => acc.add(current.duration), tc.hours(0));
    const unscheduledTime = tc.days(lastDay).sub(scheduledTime);
    const scheduledSleep = events
      .filter(({title}) => title === 'Sleep')
      .reduce((acc, current) => acc.add(current.duration), tc.hours(0));

    return {
      events: timelineEvents,
      scheduledTime,
      unscheduledTime,
      scheduledSleep,
    };
  });
};