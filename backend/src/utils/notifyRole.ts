import prisma from '../config/database';
import { notifyUser } from './notifyUser';

export async function notifyRole(
  role: 'Admin' | 'Officer',
  payload: { title: string; message: string; type: string }
) {
  try {
    const users = await prisma.user.findMany({
      where: { role, status: 'Active' },
      select: { id: true },
    });

    await Promise.all(users.map((u) => notifyUser(u.id, payload)));
  } catch (err) {
    console.error('notifyRole error:', err);
  }
}

