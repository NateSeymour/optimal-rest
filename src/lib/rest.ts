import type {Sequence} from './sequence.ts';
import {bridge, type Schedule, solve} from './schedule.ts';
import tc from 'timezonecomplete';
import type {CircadianRhythm} from './sleep.ts';

export const createOptimizedRestSchedule = (sequence: Sequence, date: string, cr: CircadianRhythm) => {
  const schedule: Schedule = [];

  const periods = Object.groupBy(sequence.flights, (flight) => flight.period);
  const lastPeriod = sequence.flights.reduce((last, current) => Math.max(last, current.period), 1);

  // Add flights
  for(const [period, flights] of Object.entries(periods)) {
    if(!flights || flights.length < 1) continue; // More than anything to get TS to shut up. Flights should never be undefined.

    schedule.push({
      type: 'duty-period',
      title: `Duty Period ${period}`,
      transparent: true,
      children: [
        {
          type: 'preparation',
          title: 'Prepare for Work',
          duration: tc.hours(1),
        },
        {
          type: 'transportation',
          title: `Transportation to ${flights[0].origin.iata}`,
          duration: tc.hours(1),
        },
        ...flights.map(flight => ({
          type: 'flight-container',
          transparent: true,
          children: [
            {
              type: 'briefing',
              title: 'Pre-Departure',
              duration: tc.hours(1),
            },
            {
              type: 'flight',
              title: `Flight to ${flight.destination.iata}`,
              start: new tc.DateTime(date, tc.zone(flight.origin.tz))
                .add(tc.days(flight.period - 1))
                .add(new tc.Duration(flight.departure)),
              duration: flight.duration,
              data: flight,
            },
            {
              type: 'debrief',
              title: 'Debrief',
              duration: tc.minutes(30),
            }
          ],
          data: flight,
        })),
        ...(Number(period) !== lastPeriod ? [{
          type: 'transportation',
          title: 'Transportation to Hotel',
          duration: tc.hours(1.5),
        }] : []),
      ],
      data: flights,
    });
  }

  solve(schedule);

  // Add layovers
  bridge(schedule, 'duty-period', (a, b) => ({
    type: 'layover',
    title: `Layover in ${a.data.at(-1).destination.mun}`,
    transparent: true,
  }));

  // Add circadian rhythm
  schedule.push({
    type: 'circadian-sleep',
    title: 'Circadian Sleep',
    transparent: true,
    start: new tc.DateTime(date, tc.local())
      .add(tc.hours(cr.bedtime)),
    end: schedule.at(-1)!.end,
    duration: tc.hours(cr.duration),
    repeat: true,
    gap: tc.hours(24).sub(tc.hours(cr.duration)),
  });

  solve(schedule);

  return schedule;
};