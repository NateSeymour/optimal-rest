import {type Ref} from "vue";
import {DateTime, type Duration} from 'timezonecomplete';
import { v4 as uuid } from 'uuid';
import type {Maybe} from "../util/maybe.ts";

export type EventRelationship = 'before' | 'after' | 'during';

export interface EventBase {
  type: string;
  duration: Duration;
  data?: any;
}

export interface AbsoluteEvent extends EventBase {
  timing: 'absolute';
  start: DateTime;
}

export interface RelativeEvent extends EventBase {
  timing: 'relative';
  parent: string;
  relationship: EventRelationship;
  offset?: Duration;
}

export type Event = AbsoluteEvent | RelativeEvent;

export class Schedule {
  private _events: Record<string, Event> = {};

  private absolute(event: Event): AbsoluteEvent {
    if(event.timing === 'absolute') return event;
    if(event.timing === 'relative') return this.absolute(this._events[event.parent]);

    throw new Error('Absolutely relative event found!');
  }

  get events(): AbsoluteEvent[] {
    return Object.values(this._events).map(this.absolute).sort((a, b) => {
      return a.start.unixUtcMillis() - b.start.unixUtcMillis();
    });
  }

  get start(): Maybe<AbsoluteEvent> { return this.events[0] || null; }

  get end(): Maybe<AbsoluteEvent> { return this.events.at(-1) || null; }

  add(event: Event) {
    const id = uuid();

    this._events[id] = event;

    return id;
  }

  importItems<T>(items: T[], resolver: (item: T) => Event) {
    for(const item of items) {
      this.add({
        ...resolver(item),
        data: item,
      });
    }
  }
}

export interface OptimizedRestScheduleOptions {
  start: Ref<string>,
  wake: Ref<string>,
}