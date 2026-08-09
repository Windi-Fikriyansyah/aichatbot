import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
export declare class TeamService {
    private prisma;
    constructor(prisma: PrismaService);
    getMembers(businessAccountId: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        businessAccountId: string;
        role: import(".prisma/client").$Enums.Role;
    })[]>;
    inviteMember(businessAccountId: string, email: string, name: string, role: Role): Promise<{
        member: {
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            businessAccountId: string;
            role: import(".prisma/client").$Enums.Role;
        };
        isNewUser: boolean;
        defaultPassword: string | null;
    }>;
    updateRole(businessAccountId: string, memberId: string, role: Role): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        businessAccountId: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    removeMember(businessAccountId: string, memberId: string): Promise<{
        success: boolean;
    }>;
}
