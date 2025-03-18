import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService){}

  async create(createUserDto: CreateUserDto) {
    const data = {
      ...createUserDto,
      password: await bcrypt.hash(createUserDto.password, 10),
    };

    const createdUser = await this.prisma.user.create({ data });

    return {
      ...createdUser,
      password: undefined,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(user => ({
      ...user,
      password: undefined
    }));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return {
      ...user,
      password: undefined
    };
  }

  async findbyUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // Se a senha foi fornecida, faça o hash dela
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return {
      ...updatedUser,
      password: undefined
    };
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: `Usuário com ID ${id} removido com sucesso` };
  }

  async updateRole(id: number, role: Role) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { role },
    });

    return {
      ...updatedUser,
      password: undefined
    };
  }
}


