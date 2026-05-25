// File: backend/src/index.ts
// Purpose: Express server with API endpoints

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import usersRoutes from './routes/users.routes';
import landRoutes from './routes/land.routes';
import requestRoutes from './routes/request.routes';

// Create Express app
const app = express();

// ✅ FIX: Convert PORT to number (process.env.PORT is string)
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'Land Portal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Digital Land Portal API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// User routes (protected)
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes);

// Land routes (protected)
app.use('/api/lands', landRoutes);

// Request routes (protected)
app.use('/api/requests', requestRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ FIX: Add explicit types to error handler parameters
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ FIX: PORT is now a number, '0.0.0.0' allows physical device access
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Land Portal API running on http://localhost:' + PORT);
  console.log('🔗 Also accessible at: http://0.0.0.0:' + PORT);
  console.log('📱 For physical devices: http://192.168.137.228:' + PORT + ' (replace with your IP)');
});

export default app;