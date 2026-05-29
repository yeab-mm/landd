// File: backend/src/index.ts
// Purpose: Express server with API endpoints + Socket.IO for live chat

import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import usersRoutes from './routes/users.routes';
import landRoutes from './routes/land.routes';
import requestRoutes from './routes/request.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import marketplaceRoutes from './routes/marketplace.routes';
import chatRoutes from './routes/chat.routes';
import { initSocket } from './socket';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Land Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    socket: true,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Digital Land Portal API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/chat', chatRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

httpServer.listen(PORT, '0.0.0.0', () => {
  const dbOk = Boolean(process.env.DATABASE_URL);
  console.log('🚀 Land Portal API running on http://localhost:' + PORT);
  console.log('🔗 Also accessible at: http://0.0.0.0:' + PORT);
  console.log('💬 Socket.IO enabled for live marketplace chat');
  console.log(dbOk ? '✅ DATABASE_URL loaded' : '❌ DATABASE_URL missing — copy backend/.env.example to backend/.env');
});

export default app;
