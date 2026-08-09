import { CatalogService } from './catalog.service';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getProducts(tenantId: string): Promise<{
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
    createProduct(tenantId: string, data: any): Promise<{
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
    updateProduct(tenantId: string, id: string, data: any): Promise<{
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
    deleteProduct(tenantId: string, id: string): Promise<{
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
