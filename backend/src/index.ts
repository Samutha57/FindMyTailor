import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import tailorRoutes from './routes/tailor.routes';
import serviceRoutes from './routes/service.routes';
import orderRoutes from './routes/order.routes';
import prisma from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  let dbStatus = 'healthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = `disconnected (${err.message})`;
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tailors', tailorRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 FindMyTailor API Server running on port ${PORT}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/api/health`);
});

export default app;
