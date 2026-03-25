import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { createSupabaseClient } from '../supabase/supabase-ssr';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(ThrottlerGuard)
  @HttpCode(200)
  async login(@Req() req, @Res() res) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 5) {
      throw new Error('Password must be at least 5 characters');
    }

    const supabase = createSupabaseClient(req, res);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    res.json({ id: data.user.id, email: data.user.email });
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req, @Res() res) {
    const supabase = createSupabaseClient(req, res);
    await supabase.auth.signOut();
    res.json({ success: true });
  }

  @Post('me')
  @HttpCode(200)
  async me(@Req() req, @Res() res) {
    const supabase = createSupabaseClient(req, res);
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.json({ user: null });
    }

    res.json({ id: user.id, email: user.email });
  }
}
