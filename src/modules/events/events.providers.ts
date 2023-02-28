import { Event } from './event.entity';
import { EVENT_REPOSITORY } from '../../core/constants';

export const eventsProviders = [
  {
    provide: EVENT_REPOSITORY,
    useValue: Event,
  },
];
