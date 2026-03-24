import { Controller, Post, Body, Inject, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';

const AI_SERVICE = 'AI_SERVICE';

@Controller('ai')
export class AiController {
  constructor(@Inject(AI_SERVICE) aiService) {
    this.aiService = aiService;
  }

  @Post('generate-reply')
  @UseGuards(AuthGuard)
  async generateReply(@Body() body) {
    if (!body?.id) {
      throw new Error('Missing message data');
    }
    return this.aiService.generateReply(body);
  }

  @Post('score-cv')
  @UseGuards(AuthGuard)
  async scoreCv(@Body() body) {
    if (!body?.id) {
      throw new Error('Missing applicant data');
    }
    return this.aiService.scoreCv(body);
  }
}
