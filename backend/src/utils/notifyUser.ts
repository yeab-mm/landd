import prisma from '../config/database';

export async function notifyUser(
  userId: string,
  payload: { title: string; message: string; type: string }
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
      },
    });
  } catch (err) {
    console.error('notifyUser error:', err);
  }
}
