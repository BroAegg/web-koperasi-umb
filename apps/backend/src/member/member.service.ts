import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class MemberService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  async findAll() {
    return this.prisma.member.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID "${id}" not found`);
    }

    return member;
  }

  async create(createMemberDto: CreateMemberDto) {
    const { email, password, ...memberData } = createMemberDto;

    // Check if member number already exists
    const existingMember = await this.prisma.member.findUnique({
      where: { memberNumber: memberData.memberNumber },
    });

    if (existingMember) {
      throw new ConflictException(`Member number ${memberData.memberNumber} already exists`);
    }

    // Create user first
    const user = await this.authService.register(email, password, 'MEMBER');

    // Then create member with user relation
    return this.prisma.member.create({
      data: {
        ...memberData,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    await this.findOne(id);

    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
      include: {
        user: {
          select: {
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const member = await this.findOne(id);

    // Delete user first (cascade will handle member deletion)
    await this.prisma.user.delete({
      where: { id: member.userId },
    });

    return { message: 'Member deleted successfully' };
  }

  async getMemberStats() {
    const totalMembers = await this.prisma.member.count();
    const newMembersThisMonth = await this.prisma.member.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(1)), // First day of current month
        },
      },
    });

    const totalSimpananPokok = await this.prisma.member.aggregate({
      _sum: {
        simpananPokok: true,
      },
    });

    const totalSimpananWajib = await this.prisma.member.aggregate({
      _sum: {
        simpananWajib: true,
      },
    });

    const totalSimpananSukarela = await this.prisma.member.aggregate({
      _sum: {
        simpananSukarela: true,
      },
    });

    return {
      totalMembers,
      newMembersThisMonth,
      totalSimpananPokok: totalSimpananPokok._sum.simpananPokok || 0,
      totalSimpananWajib: totalSimpananWajib._sum.simpananWajib || 0,
      totalSimpananSukarela: totalSimpananSukarela._sum.simpananSukarela || 0,
    };
  }
}
