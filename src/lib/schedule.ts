import {type Ref} from 'vue';
import {DateTime, type Duration} from 'timezonecomplete';
import { v4 as uuid } from 'uuid';
import type {Maybe} from '../util/maybe.ts';
import type {ResolvedFlight} from '../hooks/flight.ts';

export type EventRelationship = 'before' | 'after' | 'during';

export interface AbsoluteTiming {
  type: 'absolute';
  start: DateTime;
}

export interface RelativeTiming {
  type: 'relative';
  parent: string;
  relationship: EventRelationship;
  offset?: Duration;
}

export interface RepeatTiming {
  type: 'repeat';
  start: DateTime;
  end: DateTime;
  allowPartialEvent: boolean;
}

export interface EventBase {
  duration: Duration;
}

export type Event = EventBase & (AbsoluteTiming | RelativeTiming | RepeatTiming);

export interface FlightEvent extends EventBase, ResolvedFlight {
  type: 'flight',
}

export class Schedule {
  private _events: Record<string, Event> = {};

  private getEventStartTime(event: Event): DateTime {
    if(event.timing.type === 'absolute') return event.timing.start;
    if(event.timing.type === 'relative') return this.getEventStartTime(this._events[event.timing.parent]);

    throw new Error('Absolutely relative event found!');
  }

  get events(): Event[] {
    return Object.values(this._events).map(this.getEventStartTime).sort((a, b) => {
      return a.unixUtcMillis() - b.unixUtcMillis();
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