import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerNoteDto } from './dto/create-note.dto';

@Injectable()
export class CustomerNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(customerId: string) {
    const notes = await this.prisma.customerNote.findMany({
      where: { customerId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      // authorId is stored as a plain string field; no relation to include
    });
    return { data: notes };
  }

  async create(customerId: string, dto: CreateCustomerNoteDto, authorId?: string) {
    const note = await this.prisma.customerNote.create({
      data: {
        id: crypto.randomUUID(),
        customerId,
        authorId: authorId ?? null,
        content: dto.content,
        isPrivate: dto.isPrivate ?? false,
        tags: dto.tags ?? [],
      },
    });
    return { data: note };
  }

  async remove(customerId: string, noteId: string) {
    const note = await this.prisma.customerNote.findFirst({ where: { id: noteId, customerId, deletedAt: null } });
    if (!note) throw new NotFoundException(`Note ${noteId} not found`);
    await this.prisma.customerNote.update({ where: { id: noteId }, data: { deletedAt: new Date() } });
  }
}
