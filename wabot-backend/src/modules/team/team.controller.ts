import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { TeamService } from './team.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { TenantAccessGuard } from '../../guards/tenant-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantAccessGuard)
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  getMembers(@Headers('x-tenant-id') tenantId: string) {
    return this.teamService.getMembers(tenantId);
  }

  @Roles('OWNER', 'ADMIN')
  @Post()
  inviteMember(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: { email: string; name: string; role: Role }
  ) {
    return this.teamService.inviteMember(tenantId, body.email, body.name, body.role);
  }

  @Roles('OWNER')
  @Put(':id')
  updateRole(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body('role') role: Role
  ) {
    return this.teamService.updateRole(tenantId, id, role);
  }

  @Roles('OWNER')
  @Delete(':id')
  removeMember(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string
  ) {
    return this.teamService.removeMember(tenantId, id);
  }
}
