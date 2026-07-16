import {type Ref} from "vue";
import tc, {DateTime, type Duration} from 'timezonecomplete';
import { v4 as uuid } from 'uuid';

type Maybe<T> = T | null;

const never = () => {
  return DateTime.fromExcel(0, tc.zone('UTC'));
};

export class SimpleEvent {
  public static __type: string = 'Custom';
}

export class Event<T extends SimpleEvent = SimpleEvent> {
  id: string = uuid();
  start: DateTime = never();
  duration: Duration = tc.hours(0);

  get end() { return this.start.add(this.duration); }

  properties: Record<string, any> = {};

  data: T;

  at(start: DateTime, duration: Duration = tc.hours(0)) {
    this.start = start;
    this.duration = duration;

    return this;
  }

  after(event: Event<any>, duration: Duration = tc.hours(0)) {
    this.start = event.end;
    this.duration = duration;

    return this;
  }

  fill(first: Event<any>, second: Event<any>) {
    this.start = first.end;
    this.duration = first.end.diff(second.start);
  }

  before(event: Event<any>, duration: Duration, gap: Duration = tc.hours(0)) {
    this.start = event.start.sub(duration).sub(gap);
    this.duration = duration;

    return this;
  }

  startNow(duration: Duration = tc.hours(0)) {
    this.start = DateTime.nowLocal();
    this.duration = duration;

    return this;
  }

  with(properties: Record<string, any>) {
    Object.assign(this.properties, properties);

    return this;
  }

  constructor(config: { data: T }) {
    this.data = config.data;
  }
}

export class Schedule {
  private _events: Event[] = [];

  get events(): Event[] { return this._events; }
  get start(): Maybe<Event> { return this._events[0] || null; }
  get end(): Maybe<Event> { return this._events.at(-1) || null; }

  sort() {
    this._events.sort((a, b) => a.start.unixUtcMillis() - b.start.unixUtcMillis());
  }

  add(event: Event) {
    this._events.push(event);

    this.sort();

    return event;
  }
}

export interface OptimizedRestScheduleOptions {
  start: Ref<string>,
  wake: Ref<string>,
}