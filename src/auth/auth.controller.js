import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

const AUTH_SERVICE = 'AUTH_SERVICE';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) authService) {
    this.authService = authService;
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(@Body() body) {
    const { email, password } = body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 5) {
      throw new Error('Password must be at least 5 characters');
    }

    return this.authService.login(email, password);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  async logout(@Req() req) {
    const token = req.headers['authorization'].slice(7);
    await this.authService.logout(token);
    return { success: true };
  }
}
