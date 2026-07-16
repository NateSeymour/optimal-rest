import {type Ref} from "vue";
import tc, {DateTime, type Duration} from 'timezonecomplete';
import { v4 as uuid } from 'uuid';

type Maybe<T> = T | null;

const never = () => {
  return DateTime.fromExcel(0, tc.zone('UTC'));
};

export class Event {
  #id: string = uuid();
  #title: string = 'My Event';
  #start: DateTime = never();
  #duration: Duration = tc.hours(0);

  get id() { return this.#id; }
  get title() { return this.#title; }
  get start() { return this.#start; }
  get end() { return this.#start.add(this.#duration); }
  get duration() { return this.#duration; }

  properties: Record<string, any> = {};

  at(start: DateTime, duration: Duration = tc.hours(0)) {
    this.#start = start;
    this.#duration = duration;

    return this;
  }

  after(event: Event, duration: Duration = tc.hours(0)) {
    this.#start = event.end;
    this.#duration = duration;

    return this;
  }

  fill(first: Event, second: Event) {
    this.#start = first.end;
    this.#duration = first.end.diff(second.start);
  }

  before(event: Event, duration: Duration, gap: Duration = tc.hours(0)) {
    this.#start = event.#start.sub(duration).sub(gap);
    this.#duration = duration;

    return this;
  }

  startNow(duration: Duration = tc.hours(0)) {
    this.#start = DateTime.nowLocal();
    this.#duration = duration;

    return this;
  }

  with(properties: Record<string, any>) {
    Object.assign(this.properties, properties);

    return this;
  }

  constructor(title: string) {
    this.#title = title;
  }
}

export class Schedule {
  #events: Event[] = [];

  get events(): Event[] { return this.#events; }
  get start(): Maybe<Event> { return this.#events[0] || null; }
  get end(): Maybe<Event> { return this.#events.at(-1) || null; }

  groupEventsByFunctor(functor: (item: Event, index: number) => PropertyKey) {
    return Object.groupBy(this.#events, functor);
  }

  filterByProperty(property: string, value: any) {
    return this.#events.filter((event) => event.properties[property] === value);
  }

  #sort() {
    this.#events.sort((a, b) => a.start.unixUtcMillis() - b.start.unixUtcMillis());
  }

  add(event: Event) {
    this.#events.push(event);

    this.#sort();

    return event;
  }
}

export interface OptimizedRestScheduleOptions {
  start: Ref<string>,
  wake: Ref<string>,
}