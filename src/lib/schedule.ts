import tc, {DateTime, type Duration} from 'timezonecomplete';
import {v4 as uuid} from 'uuid';

export interface ScheduleEvent {
  id?: string;
  type: string;
  title?: string,
  transparent?: boolean;
  data?: any;
  start?: DateTime;
  end?: DateTime;
  duration?: Duration;
  repeat?: boolean;
  gap?: Duration,
  children?: ScheduleEvent[],
}

export type Schedule = ScheduleEvent[];

export const solve = (schedule: Schedule) : Schedule => {
  let unresolvedEvents = 0;

  for(let i = 0; i < schedule.length; i++) {
    const item = schedule[i];

    if(item.children && item.children.length > 0) {
      const children = solve(item.children);

      if(item.start || item.end || item.duration) {
        throw new Error('Container Events must have relative timing!');
      }

      item.start = children[0].start!;
      item.end = children.at(-1)!.end!;
      item.duration = item.end.diff(item.start);

      schedule.splice(i, 0, ...children);

      delete item.children;
    }
    else if(item.repeat) {
      if(!item.start || !item.end || !item.duration) {
        throw new Error('Repeating events need a start, end time and duration!');
      }

      const events: ScheduleEvent[] = [];
      do {
        const start = events.at(-1)?.end?.add(item.gap || tc.hours(0)) || item.start;
        events.push({
          type: item.type,
          title: item.title,
          transparent: item.transparent,
          start,
          end: start.add(item.duration),
          duration: item.duration,
        });
      } while(events.at(-1)!.end!.unixUtcMillis() < item.end.unixUtcMillis());

      schedule.splice(i, 1, ...events);
    }
    else if(item.start && item.end) {
      continue;
    }
    else if(item.start && item.duration) {
      item.end = item.start.add(item.duration);
    }
    else if(item.end && item.duration) {
      item.start = item.end.sub(item.duration);
    }
    else if(item.duration) {
      unresolvedEvents++;
      continue;
    }
    else {
      throw new Error('Event is unresolvable!');
    }

    // Event must, by now, be resolved. Use it to resolve nearby relative events.
    for(let y = i - 1; y >= 0; y--) {
      const neighbor = schedule[y];

      if(neighbor.start || neighbor.end || neighbor.children) break;

      if(!neighbor.duration) {
        throw new Error('Event is unresolvable!');
      }

      neighbor.end = schedule[y + 1].start!;
      neighbor.start = neighbor.end.sub(neighbor.duration);

      unresolvedEvents--;
    }

    for(let y = i + 1; y < schedule.length; y++) {
      const neighbor = schedule[y];

      if(neighbor.start || neighbor.end || neighbor.children) break;

      if(!neighbor.duration) {
        throw new Error('Event is unresolvable!');
      }

      neighbor.start = schedule[y - 1].end!;
      neighbor.end = neighbor.start.add(neighbor.duration);

      unresolvedEvents--;
    }

    if(!item.id) {
      item.id = uuid();
    }
  }

  if(unresolvedEvents > 0) {
    throw new Error('Some relative events were not able to be resolved!');
  }

  return schedule.sort((a, b) => a.start!.unixUtcMillis() - b.start!.unixUtcMillis());
};

export const bridge = (schedule: Schedule, type: string, bridger: (a: ScheduleEvent, b: ScheduleEvent) => ScheduleEvent): Schedule => {
  const events = schedule.filter(event => event.type === type);

  const bridges = events.length - 1;
  for(let i = 0; i < bridges; i++) {
    const a = events[i];
    const b = events[i + 1];

    if(!a.end || !b.start) {
      throw new Error('Only resolved events can be bridged!');
    }

    schedule.push({
      ...bridger(a, b),
      start: a.end,
      end: b.start,
      duration: b.start.diff(a.end),
    });
  }

  return solve(schedule);
};

export interface ScheduleMergeOptions {
  empty: string;
}

export const merge = (schedule: Schedule, from: string, to: string, options: ScheduleMergeOptions) => {};