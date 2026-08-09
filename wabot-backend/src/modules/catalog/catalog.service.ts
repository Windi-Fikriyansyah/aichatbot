import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getProducts(businessAccountId: string) {
    return this.prisma.product.findMany({
      where: { businessAccountId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createProduct(businessAccountId: string, data: any) {
    return this.prisma.product.create({
      data: {
        businessAccountId,
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
      }
    });
  }

  async updateProduct(businessAccountId: string, id: string, data: any) {
    return this.prisma.product.update({
      where: { id, businessAccountId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? parseFloat(data.price) : null,
      }
    });
  }

  async deleteProduct(businessAccountId: string, id: string) {
    return this.prisma.product.delete({
      where: { id, businessAccountId }
    });
  }
}
