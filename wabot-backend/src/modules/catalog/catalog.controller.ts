import { Controller, Get, Post, Put, Delete, Param, Body, Headers, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';

@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('api/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getProducts(@Headers('x-tenant-id') tenantId: string) {
    return this.catalogService.getProducts(tenantId);
  }

  @Post()
  createProduct(@Headers('x-tenant-id') tenantId: string, @Body() data: any) {
    return this.catalogService.createProduct(tenantId, data);
  }

  @Put(':id')
  updateProduct(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.catalogService.updateProduct(tenantId, id, data);
  }

  @Delete(':id')
  deleteProduct(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    return this.catalogService.deleteProduct(tenantId, id);
  }
}
