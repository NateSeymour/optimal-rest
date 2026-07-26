import {DateTime, type Duration} from 'timezonecomplete';

export interface RepeatTiming {
  start: DateTime;
  end: DateTime;
  offset: Duration;
  allowPartialEvent?: boolean;
}

export interface UnresolvedScheduleEvent {
  type: string;
  duration: Duration;
  data?: any;
}

export interface ScheduleEvent extends UnresolvedScheduleEvent {
  start: DateTime;
}

export type Schedule = ScheduleEvent[];

export interface RelativeTiming {
  relationship: 'before' | 'after' | 'during';
  offset?: Duration;
}

export const resolveScheduleEvent = (parent: ScheduleEvent, timing: RelativeTiming, event: UnresolvedScheduleEvent | UnresolvedScheduleEvent[]) => {

};

export interface ScheduleEventTypeView {
  type: 'event';
  value: string;
}

export interface ScheduleLinearView {
  type: 'linear';
  direction: 'backward' | 'forward';
}

export type ScheduleView = ScheduleEventTypeView | ScheduleLinearView;

export const scheduleView = (schedule: Schedule, view: ScheduleView) => {
  if(view.type === 'event') {
    return schedule.filter(event => event.type === view.value);
  }

  if(view.type === 'linear') {
    return schedule.toSorted((a, b) => {
      const diff = a.start.unixUtcMillis() - b.start.unixUtcMillis();

      if(view.direction === 'forward') return diff;
      if(view.direction === 'backward') return diff * -1;

      return 0;
    });
  }
};

export const createRepeatingScheduleEvent = (timing: RepeatTiming, event: UnresolvedScheduleEvent) => {
  const schedule: Schedule = [];

  let currentTime: DateTime = timing.start;
  while(currentTime.unixUtcMillis() < timing.end.unixUtcMillis()) {
    const eventEnd = currentTime.add(event.duration);
    if(eventEnd.unixUtcMillis() < timing.end.unixUtcMillis() || timing.allowPartialEvent) {
      schedule.push({
        ...event,
        start: currentTime,
      });
    }

    currentTime = eventEnd.add(timing.offset);
  }

  return schedule;
};