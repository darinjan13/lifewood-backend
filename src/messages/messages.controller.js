import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/auth.guard';

const MESSAGES_SERVICE = 'MESSAGES_SERVICE';

@Controller('messages')
export class MessagesController {
  constructor(@Inject(MESSAGES_SERVICE) messagesService) {
    this.messagesService = messagesService;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.messagesService.findAll();
  }

  @Post()
  async create(@Body() body) {
    const { name, email, message, type } = body;
    if (!name || !email || !message || !type) {
      throw new Error('Missing required fields');
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email');
    }
    return this.messagesService.create(body);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async update(@Body() body) {
    const { id, ...fields } = body;
    if (!id) {
      throw new Error('Missing id');
    }
    return this.messagesService.update(id, fields);
  }
}
