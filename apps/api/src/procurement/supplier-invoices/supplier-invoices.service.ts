import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/services/audit.service';
import { CreateSupplierInvoiceDto } from './dto/create-supplier-invoice.dto';

export interface QuerySupplierInvoicesDto {
  supplierId?: string;
  branchId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SupplierInvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async findAll(query: QuerySupplierInvoicesDto) {
    const { page = 1, limit = 20, supplierId, branchId, status } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (supplierId) where['supplierId'] = supplierId;
    if (branchId) where['branchId'] = branchId;
    if (status) where['status'] = status;

    const [data, total] = await Promise.all([
      this.prisma.supplierPayment.findMany({
        where, skip, take: limit,
        include: {
          supplier: { select: { id: true, name: true, code: true } },
          branch: { select: { id: true, name: true, code: true } },
          purchaseOrder: { select: { id: true, poNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supplierPayment.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.supplierPayment.findUnique({
      where: { id },
      include: { supplier: true, branch: true, purchaseOrder: true },
    });
    if (!invoice) throw new NotFoundException(`Supplier invoice ${id} not found`);
    return { data: invoice };
  }

  async create(dto: CreateSupplierInvoiceDto, userId?: string) {
    const paymentNumber = `SINV-${dto.invoiceNumber}-${Date.now()}`;
    const invoice = await this.prisma.supplierPayment.create({
      data: {
        id: crypto.randomUUID(),
        paymentNumber,
        supplierId: dto.supplierId,
        purchaseOrderId: dto.purchaseOrderId ?? null,
        branchId: dto.branchId,
        originalCurrencyCode: dto.originalCurrencyCode,
        originalAmount: dto.originalAmount,
        convertedCurrencyCode: dto.convertedCurrencyCode ?? null,
        convertedAmount: dto.convertedAmount ?? null,
        exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
        method: 'BANK_TRANSFER',
        status: 'PENDING',
        notes: dto.notes ?? null,
        processedById: userId ?? null,
      },
    });
    await this.audit.log({ userId, action: 'CREATE', entityType: 'supplier_invoice', entityId: invoice.id });
    return { data: invoice };
  }

  async markPaid(id: string, userId?: string) {
    const invoice = await this.prisma.supplierPayment.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Supplier invoice ${id} not found`);
    if (invoice.status === 'COMPLETED') throw new BadRequestException('Invoice already marked as paid');
    const updated = await this.prisma.supplierPayment.update({
      where: { id },
      data: { status: 'COMPLETED', paidAt: new Date(), processedById: userId ?? null },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'supplier_invoice', entityId: id, description: 'Marked paid' });
    return { data: updated };
  }

  async cancel(id: string, userId?: string) {
    const invoice = await this.prisma.supplierPayment.findUnique({ where: { id } });
    if (!invoice) throw new NotFoundException(`Supplier invoice ${id} not found`);
    if (invoice.status === 'COMPLETED') throw new BadRequestException('Cannot cancel a paid invoice');
    const updated = await this.prisma.supplierPayment.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    await this.audit.log({ userId, action: 'UPDATE', entityType: 'supplier_invoice', entityId: id, description: 'Cancelled' });
    return { data: updated };
  }
}
