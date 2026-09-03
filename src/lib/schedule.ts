import {DateTime, type Duration} from 'timezonecomplete';

export interface ScheduleEventBase {
  type: string;
  title?: string,
  transparent?: boolean;
  data?: any;
}

export interface PlannedScheduleEvent extends ScheduleEventBase {
  start?: DateTime;
  end?: DateTime;
  duration?: Duration;
  repeat?: boolean;
  gap?: Duration,
  allowPartial?: boolean;
  children?: PlannedScheduleEvent[],
}

export interface ResolvedScheduleEvent extends ScheduleEventBase {
  start: DateTime;
  end: DateTime;
  duration: Duration;
}

export type Schedule = (PlannedScheduleEvent | ResolvedScheduleEvent)[];

export interface ScheduleConflict {}

export const solve = (schedule: Schedule) : ScheduleConflict[] => {
  return [];
};

export interface ScheduleMergeOptions {}

export const merge = (schdule: Schedule, from: string, to: string, options: ScheduleMergeOptions) => {};