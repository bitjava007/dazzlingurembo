import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where = { deletedAt: null };
    const [data, total] = await Promise.all([
      this.prisma.expenseCategory.findMany({
        where, skip, take: limit,
        include: { parent: { select: { id: true, name: true, code: true } }, _count: { select: { children: true, expenses: true } } },
        orderBy: { name: 'asc' },
      }),
      this.prisma.expenseCategory.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const cat = await this.prisma.expenseCategory.findUnique({
      where: { id, deletedAt: null },
      include: { parent: true, children: { where: { deletedAt: null } } },
    });
    if (!cat) throw new NotFoundException(`Expense category ${id} not found`);
    return { data: cat };
  }

  async create(dto: CreateExpenseCategoryDto, userId?: string) {
    if (dto.code) {
      const existing = await this.prisma.expenseCategory.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException(`Expense category with code ${dto.code} already exists`);
    }
    const cat = await this.prisma.expenseCategory.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code ?? null,
        description: dto.description ?? null,
        parentId: dto.parentId ?? null,
        isActive: dto.isActive ?? true,
        isTaxable: dto.isTaxable ?? false,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'expense_category', entityId: cat.id });
    return { data: cat };
  }

  async update(id: string, dto: Partial<CreateExpenseCategoryDto>, userId?: string) {
    const cat = await this.prisma.expenseCategory.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException(`Expense category ${id} not found`);
    const updated = await this.prisma.expenseCategory.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        parentId: dto.parentId,
        isActive: dto.isActive,
        isTaxable: dto.isTaxable,
      },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'expense_category', entityId: id });
    return { data: updated };
  }

  async remove(id: string, userId?: string) {
    const cat = await this.prisma.expenseCategory.findUnique({ where: { id, deletedAt: null } });
    if (!cat) throw new NotFoundException(`Expense category ${id} not found`);
    await this.prisma.expenseCategory.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entityType: 'expense_category', entityId: id });
    return { data: { success: true } };
  }
}
