import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class MemberService {
  async list() {
    return prisma.member.findMany();
  }

  async create(data: any) {
    return prisma.member.create({ data });
  }

  async get(id: string) {
    return prisma.member.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.member.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.member.delete({ where: { id } });
  }
}
