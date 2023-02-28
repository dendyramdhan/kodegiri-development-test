import { Injectable, Inject } from '@nestjs/common';

import { Event } from './event.entity';
import { EventDto } from './dto/event.dto';
import { User } from '../users/user.entity';
import { EVENT_REPOSITORY } from '../../core/constants';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: typeof Event,
  ) {}

  async create(event: EventDto, userId): Promise<Event> {
    return await this.eventRepository.create<Event>({ ...event, userId });
  }

  async findAll(
    page: number,
    size: number,
  ): Promise<{ rows: Event[]; count: number }> {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;

    return await this.eventRepository.findAndCountAll<Event>({
      include: [{ model: User, attributes: { exclude: ['password'] } }],
      limit: limit,
      offset: offset,
    });
  }

  async findOne(id): Promise<Event> {
    return await this.eventRepository.findOne({
      where: { id },
      include: [{ model: User, attributes: { exclude: ['password'] } }],
    });
  }

  async delete(id, userId) {
    return await this.eventRepository.destroy({ where: { id, userId } });
  }

  async update(id, data, userId) {
    const [numberOfAffectedRows, [updatedEvent]] =
      await this.eventRepository.update(
        { ...data },
        { where: { id, userId }, returning: true },
      );
    return { numberOfAffectedRows, updatedEvent };
  }
}
