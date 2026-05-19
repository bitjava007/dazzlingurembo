import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import type { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<Omit<User, 'password'>[]> {
    const { skip, take, where, orderBy } = params ?? {};
    const users = await this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy: orderBy ?? { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
    return users as Omit<User, 'password'>[];
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return user as Omit<User, 'password'>;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException(`User with email "${createUserDto.email}" already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name ?? null,
        password: hashedPassword,
        role: createUserDto.role ?? 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    this.logger.log(`Created user: ${user.email}`);
    return user as Omit<User, 'password'>;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    await this.findOne(id); // throws if not found

    const data: Prisma.UserUpdateInput = {};
    if (updateUserDto.email) data.email = updateUserDto.email;
    if (updateUserDto.name !== undefined) data.name = updateUserDto.name;
    if (updateUserDto.role) data.role = updateUserDto.role;
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, this.SALT_ROUNDS);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });

    return user as Omit<User, 'password'>;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // throws if not found
    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`Deleted user: ${id}`);
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }
}
