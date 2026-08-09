import { PrismaService } from '../../prisma/prisma.service';
export declare class CatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(businessAccountId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessAccountId: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number | null;
        imageUrl: string | null;
        isActive: boolean;
    }[]>;
    createProduct(businessAccountId: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessAccountId: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number | null;
        imageUrl: string | null;
        isActive: boolean;
    }>;
    updateProduct(businessAccountId: string, id: string, data: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessAccountId: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number | null;
        imageUrl: string | null;
        isActive: boolean;
    }>;
    deleteProduct(businessAccountId: string, id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        businessAccountId: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        stock: number | null;
        imageUrl: string | null;
        isActive: boolean;
    }>;
}
