import prisma from '../config/prisma';
import { Role, User } from '@prisma/client';
import { hashPassword } from '../utils/password';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { IUserService } from '../interfaces/services/IUserService';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';

class UserService implements IUserService {
  public async getUsers(role?: Role) {
    const where = role ? { role } : {};
    return prisma.user.findMany({
      where,
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        dernierLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        actif: true,
        dernierLogin: true,
        createdAt: true,
        loginAudits: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }

    return user;
  }

  public async createUser(data: CreateUserDTO) {
    const { nom, prenom, email, motDePasse, role } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Cet email est déjà utilisé');
    }

    const hashedPassword = await hashPassword(motDePasse);

    return prisma.user.create({
      data: {
        nom,
        prenom,
        email,
        motDePasse: hashedPassword,
        role,
      },
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
    });
  }

  public async updateUser(id: number, data: UpdateUserDTO) {
    const { email, ...restData } = data;
    const updateData: any = { ...restData };

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictError('Cet email est déjà utilisé');
      }
      updateData.email = email;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nom: true, prenom: true, email: true, role: true, actif: true },
    });
  }

  public async deleteUser(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestError('Vous ne pouvez pas vous supprimer vous-même');
    }

    await prisma.user.update({
      where: { id },
      data: { actif: false },
    });
  }

  public async getTechniciens() {
    return prisma.user.findMany({
      where: { role: Role.TECHNICIEN, actif: true },
      select: { id: true, nom: true, prenom: true },
      orderBy: { nom: 'asc' },
    });
  }
}

export const userService = new UserService();
