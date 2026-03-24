import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { AuthGuard } from '../auth/auth.guard';

const APPLICATIONS_SERVICE = 'APPLICATIONS_SERVICE';

@Controller('applications')
export class ApplicationsController {
  constructor(@Inject(APPLICATIONS_SERVICE) applicationsService) {
    this.applicationsService = applicationsService;
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll() {
    return this.applicationsService.findAll();
  }

  @Post()
  async create(@Body() body) {
    const { first_name, last_name, email, phone, position, country } = body;
    if (!first_name || !last_name || !email || !phone || !position || !country) {
      throw new Error('Missing required fields');
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Invalid email');
    }
    return this.applicationsService.create(body);
  }

  @Post('check-email')
  async checkEmail(@Body() body) {
    const { email } = body;
    if (!email) {
      return { exists: false };
    }
    return this.applicationsService.findByEmail(email);
  }

  @Patch()
  @UseGuards(AuthGuard)
  async update(@Body() body) {
    const { id, ...fields } = body;
    if (!id) {
      throw new Error('Missing id');
    }
    return this.applicationsService.update(id, fields);
  }
}
