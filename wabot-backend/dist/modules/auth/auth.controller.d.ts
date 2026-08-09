import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            onboarded: boolean;
        };
    }>;
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            onboarded: boolean;
        };
        tenantId: string | null;
    }>;
    getMe(req: any): {
        user: any;
        role: any;
    };
}
