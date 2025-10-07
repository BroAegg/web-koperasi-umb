import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ProductService {
  async list() {
    return prisma.product.findMany();
  }

  async create(data: any) {
    return prisma.product.create({ data });
  }

  async get(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, data: any) {
    return prisma.product.update({ where: { id }, data });
  }

  async remove(id: string) {
    return prisma.product.delete({ where: { id } });
  }
}
