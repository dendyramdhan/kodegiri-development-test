import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { EventsService } from './events.service';
import { Event as EventEntity } from './event.entity';
import { EventDto } from './dto/event.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiUnprocessableEntityResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Event')
@Controller('events')
export class EventsController {
  constructor(private readonly eventService: EventsService) {}

  @ApiOkResponse()
  @Get()
  async findAll(@Query('page') page: number, @Query('size') size: number) {
    // get all events in the db
    return await this.eventService.findAll(page, size);
  }

  @ApiNotFoundResponse({ description: 'Not Found' })
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<EventEntity> {
    // find the event with this id
    const event = await this.eventService.findOne(id);

    // if the event doesn't exit in the db, throw a 404 error
    if (!event) {
      throw new NotFoundException("This Event doesn't exist");
    }

    // if event exist, return the event
    return event;
  }

  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: 'Created Succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() event: EventDto, @Request() req): Promise<EventEntity> {
    // create a new event and return the newly created event
    return await this.eventService.create(event, req.user.id);
  }

  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Updated Succesfully' })
  @ApiUnprocessableEntityResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() event: EventDto,
    @Request() req,
  ): Promise<EventEntity> {
    // get the number of row affected and the updated event
    const { numberOfAffectedRows, updatedEvent } =
      await this.eventService.update(id, event, req.user.id);

    // if the number of row affected is zero, it means the event doesn't exist in our db
    if (numberOfAffectedRows === 0) {
      throw new NotFoundException("This event doesn't exist");
    }

    // return the updated event
    return updatedEvent;
  }

  @ApiBearerAuth('access-token')
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Request' })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number, @Request() req) {
    // delete the event with this id
    const deleted = await this.eventService.delete(id, req.user.id);

    // if the number of row affected is zero, then the event doesn't exist in our db
    if (deleted === 0) {
      throw new NotFoundException("This event doesn't exist");
    }

    // return success message
    return 'Successfully deleted';
  }
}
