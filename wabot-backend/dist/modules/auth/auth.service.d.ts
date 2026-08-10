import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(email: string, pass: string, name: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            onboarded: boolean;
        };
    }>;
    login(email: string, pass: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            onboarded: boolean;
        };
        tenantId: string | null;
    }>;
    getUserSubscription(userId: string): Promise<{
        id: string;
        plan: string;
        status: string;
        convUsed: number;
        convLimit: number;
        periodStart: Date;
        periodEnd: Date;
        userId: string;
    } | null>;
}
