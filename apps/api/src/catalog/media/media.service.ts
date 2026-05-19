import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(productId: string) {
    const data = await this.prisma.productMedia.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
    });
    return { data };
  }

  async create(productId: string, dto: CreateMediaDto) {
    if (dto.isPrimary) {
      await this.prisma.productMedia.updateMany({ where: { productId, isPrimary: true }, data: { isPrimary: false } });
    }
    const media = await this.prisma.productMedia.create({
      data: {
        id: crypto.randomUUID(),
        productId,
        type: dto.type,
        url: dto.url,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        altText: dto.altText ?? null,
        title: dto.title ?? null,
        mimeType: dto.mimeType ?? null,
        sizeBytes: dto.sizeBytes ?? null,
        position: dto.position ?? 0,
        isPrimary: dto.isPrimary ?? false,
      },
    });
    return { data: media };
  }

  async remove(id: string) {
    const media = await this.prisma.productMedia.findUnique({ where: { id } });
    if (!media) throw new NotFoundException(`Media ${id} not found`);
    await this.prisma.productMedia.delete({ where: { id } });
  }
}
