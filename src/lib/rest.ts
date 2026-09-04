import type {Sequence} from './sequence.ts';
import {type Schedule, solve} from './schedule.ts';
import tc from 'timezonecomplete';
import type {CircadianRhythm} from './sleep.ts';

export const createOptimizedRestSchedule = (sequence: Sequence, date: string, cr: CircadianRhythm) => {
  const schedule: Schedule = [];

  // Add flights
  for(const flight of sequence.flights) {
    schedule.push({
      type: 'flight-container',
      transparent: true,
      children: [
        {
          type: 'preparation',
          title: 'Prepare for Flight',
          duration: tc.hours(1),
        },
        {
          type: 'transportation',
          title: `Transportation to ${flight.origin.iata}`,
          duration: tc.hours(1),
        },
        {
          type: 'briefing',
          title: 'Briefing',
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
    });
  }

  // Solve for flights
  solve(schedule);

  // Add circadian rhythm
  schedule.push({
    type: 'circadian-sleep',
    title: 'Circadian Sleep',
    transparent: true,
    start: new tc.DateTime(date, tc.local())
      .sub(tc.days(1))
      .add(tc.hours(cr.bedtime)),
    end: schedule.at(-1)!.end,
    duration: tc.hours(cr.duration),
    repeat: true,
    gap: tc.hours(24).sub(tc.hours(cr.duration)),
  });

  solve(schedule);

  return schedule;
};