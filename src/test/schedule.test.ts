import {expect, test} from 'vitest';
import {type Schedule, solve} from "../lib/schedule.ts";
import tc from "timezonecomplete";

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

  console.log(schedule);

  expect(schedule.length).toBe(4);
});