import { TeamService } from './team.service';
import { Role } from '@prisma/client';
export declare class TeamController {
    private readonly teamService;
    constructor(teamService: TeamService);
    getMembers(tenantId: string): Promise<({
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
    inviteMember(tenantId: string, body: {
        email: string;
        name: string;
        role: Role;
    }): Promise<{
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
    updateRole(tenantId: string, id: string, role: Role): Promise<{
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
    removeMember(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
