import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeamService {
  constructor(private prisma: PrismaService) {}

  async getMembers(businessAccountId: string) {
    return this.prisma.tenantMember.findMany({
      where: { businessAccountId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async inviteMember(businessAccountId: string, email: string, name: string, role: Role) {
    // Cari user by email
    let user = await this.prisma.user.findUnique({ where: { email } });
    let isNewUser = false;
    const defaultPassword = 'wabot' + Math.floor(1000 + Math.random() * 9000); // e.g. wabot1234

    if (!user) {
      // Jika user belum ada, buatkan
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        }
      });
      isNewUser = true;
    }

    // Cek apakah sudah jadi member di tenant ini
    const existingMember = await this.prisma.tenantMember.findUnique({
      where: {
        userId_businessAccountId: {
          userId: user.id,
          businessAccountId
        }
      }
    });

    if (existingMember) {
      throw new BadRequestException('Pengguna sudah menjadi anggota di tenant ini.');
    }

    // Tambahkan ke tenant
    const newMember = await this.prisma.tenantMember.create({
      data: {
        userId: user.id,
        businessAccountId,
        role
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      member: newMember,
      isNewUser,
      defaultPassword: isNewUser ? defaultPassword : null
    };
  }

  async updateRole(businessAccountId: string, memberId: string, role: Role) {
    // Pastikan memberId valid
    const member = await this.prisma.tenantMember.findUnique({
      where: { id: memberId }
    });

    if (!member || member.businessAccountId !== businessAccountId) {
      throw new NotFoundException('Anggota tidak ditemukan.');
    }

    // Jangan izinkan mengubah role owner terakhir (bisa disempurnakan nanti)
    if (member.role === 'OWNER' && role !== 'OWNER') {
      const ownerCount = await this.prisma.tenantMember.count({
        where: { businessAccountId, role: 'OWNER' }
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Tidak bisa mengubah role Owner terakhir.');
      }
    }

    return this.prisma.tenantMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async removeMember(businessAccountId: string, memberId: string) {
    const member = await this.prisma.tenantMember.findUnique({
      where: { id: memberId }
    });

    if (!member || member.businessAccountId !== businessAccountId) {
      throw new NotFoundException('Anggota tidak ditemukan.');
    }

    if (member.role === 'OWNER') {
      const ownerCount = await this.prisma.tenantMember.count({
        where: { businessAccountId, role: 'OWNER' }
      });
      if (ownerCount <= 1) {
        throw new BadRequestException('Tidak bisa menghapus Owner terakhir.');
      }
    }

    await this.prisma.tenantMember.delete({
      where: { id: memberId }
    });

    return { success: true };
  }
}
