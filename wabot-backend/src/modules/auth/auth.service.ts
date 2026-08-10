import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(email: string, pass: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new BadRequestException('Email sudah terdaftar');

    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscriptions: {
          create: {
            plan: 'STARTER',
            status: 'ACTIVE',
            convUsed: 0,
            convLimit: 500,
            periodStart: new Date(),
            periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
          }
        }
      }
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, name: user.name, onboarded: user.onboarded }
    };
  }

  async login(email: string, pass: string) {
    console.log('[AUTH DEBUG] Login attempt:', { email, passLength: pass?.length, passReceived: !!pass });
    
    const user = await this.prisma.user.findUnique({ where: { email } });
    console.log('[AUTH DEBUG] User found:', !!user, user ? { id: user.id, email: user.email } : 'NOT FOUND');
    
    if (!user) throw new UnauthorizedException('Kredensial tidak valid - user tidak ditemukan');

    const isMatch = await bcrypt.compare(pass, user.password);
    console.log('[AUTH DEBUG] Password match:', isMatch);
    
    if (!isMatch) throw new UnauthorizedException('Kredensial tidak valid - password salah');

    const payload = { sub: user.id, email: user.email };
    
    const tenantMember = await this.prisma.tenantMember.findFirst({
      where: { userId: user.id }
    });

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        onboarded: user.onboarded 
      },
      tenantId: tenantMember?.businessAccountId || null
    };
  }
  async getUserSubscription(userId: string) {
    return this.prisma.subscription.findUnique({
      where: { userId }
    });
  }
}
