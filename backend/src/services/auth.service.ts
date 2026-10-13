import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config/env';

export const authService = {
  async login(email: string, password: string, rememberMe = false) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Credenciales inválidas');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: rememberMe ? '30d' : '8h' }
    );
    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    };
  },

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, createdAt: true },
    });
    if (!user) throw new Error('Usuario no encontrado');
    return user;
  },

  async updateProfile(userId: number, data: { nombre: string; email: string }) {
    const existing = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    });
    if (existing) throw new Error('Ese correo ya está registrado');
    return prisma.user.update({
      where: { id: userId },
      data: { nombre: data.nombre, email: data.email },
      select: { id: true, nombre: true, email: true },
    });
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuario no encontrado');
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new Error('La contraseña actual es incorrecta');
    const password = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password } });
  },
};
