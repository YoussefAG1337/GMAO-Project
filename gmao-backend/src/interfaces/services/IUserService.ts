import { CreateUserDTO, UpdateUserDTO } from '../../dtos/user.dto';
import { User, Role } from '@prisma/client';

export interface IUserService {
  getUsers(role?: Role): Promise<any[]>;
  getUserById(id: number): Promise<any>;
  createUser(data: CreateUserDTO): Promise<any>;
  updateUser(id: number, data: UpdateUserDTO): Promise<any>;
  deleteUser(id: number, currentUserId: number): Promise<void>;
  getTechniciens(): Promise<any[]>;
}
