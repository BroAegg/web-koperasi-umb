import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalMembers, totalAdmins, lowStockProducts, totalProducts] =
      await Promise.all([
        this.prisma.member.count(),
        this.prisma.user.count({
          where: { role: Role.ADMIN },
        }),
        this.prisma.product.findMany({
          where: {
            stock: {
              lte: 10, // Default threshold
            },
          },
          orderBy: { stock: 'asc' },
        }),
        this.prisma.product.count(),
      ]);

    const totalSimpanan = await this.prisma.member.aggregate({
      _sum: {
        simpananPokok: true,
        simpananWajib: true,
        simpananSukarela: true,
      },
    });

    return {
      members: {
        total: totalMembers,
      },
      admins: {
        total: totalAdmins,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
      },
      simpanan: {
        pokok: totalSimpanan._sum.simpananPokok || 0,
        wajib: totalSimpanan._sum.simpananWajib || 0,
        sukarela: totalSimpanan._sum.simpananSukarela || 0,
        total:
          (totalSimpanan._sum.simpananPokok || 0) +
          (totalSimpanan._sum.simpananWajib || 0) +
          (totalSimpanan._sum.simpananSukarela || 0),
      },
    };
  }
}