import {expect, test} from 'vitest';
import {type Schedule, solve} from '../lib/schedule.ts';
import tc from 'timezonecomplete';

test('Containerized Events', () => {
  const schedule: Schedule = [{
    type: 'container',
    transparent: true,
    children: [
      {
        type: 'one',
        duration: tc.hours(1),
      },
      {
        type: 'two',
        start: tc.DateTime.now(),
        duration: tc.hours(1),
      }
    ],
  }];

  solve(schedule);

  console.log(schedule);

  expect(schedule.length).toBe(3);

  for(const event of schedule) {
    if(event.type === 'container') {
      expect(event.duration!.hours()).toBe(2);
    }
    else {
      expect(event.duration!.hours()).toBe(1);
    }
  }
});

test('Repeating Event', () => {
  const start = tc.DateTime.now();

  const schedule: Schedule = [{
    type: 'test',
    start,
    end: start.add(tc.hours(4)),
    duration: tc.hours(1),
    repeat: true,
  }];

  solve(schedule);

  expect(schedule.length).toBe(4);
});