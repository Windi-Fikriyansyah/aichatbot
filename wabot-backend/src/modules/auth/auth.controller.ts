import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard, TenantAccessGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const sub = await this.authService.getUserSubscription(req.user.sub || req.user.userId || req.tenant?.userId);
    return {
      user: req.user,
      role: req.tenant?.role,
      plan: sub?.plan || 'STARTER',
      status: sub?.status || 'INACTIVE'
    };
  }
}
