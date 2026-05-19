import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.notificationTemplate.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return { data };
  }

  async findOne(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({
      where: { id, deletedAt: null },
    });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    return { data: template };
  }

  async findByCode(code: string) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { code, deletedAt: null, isActive: true },
    });
    return template;
  }

  async create(dto: CreateTemplateDto) {
    const template = await this.prisma.notificationTemplate.create({
      data: {
        id: crypto.randomUUID(),
        name: dto.name,
        code: dto.code,
        channel: dto.channel as any,
        subject: dto.subject ?? null,
        bodyHtml: dto.bodyTemplate,
        bodyText: dto.bodyTemplate,
        variables: dto.variables ?? [],
        isActive: dto.isActive ?? true,
      },
    });
    return { data: template };
  }

  async update(id: string, dto: Partial<CreateTemplateDto>) {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { id, deletedAt: null } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    const updated = await this.prisma.notificationTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        channel: dto.channel as any,
        subject: dto.subject,
        bodyHtml: dto.bodyTemplate,
        bodyText: dto.bodyTemplate,
        variables: dto.variables,
        isActive: dto.isActive,
      },
    });
    return { data: updated };
  }

  async remove(id: string) {
    const template = await this.prisma.notificationTemplate.findUnique({ where: { id, deletedAt: null } });
    if (!template) throw new NotFoundException(`Template ${id} not found`);
    await this.prisma.notificationTemplate.update({ where: { id }, data: { deletedAt: new Date() } });
    return { data: { id } };
  }

  render(bodyTemplate: string, variables: Record<string, string>): string {
    let rendered = bodyTemplate;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
    return rendered;
  }
}
