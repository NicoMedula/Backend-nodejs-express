import express from 'express';
import { createServer } from 'node:http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import { PORT, FRONTEND_URL, NODE_ENV } from './config/env.js';
import { initSocket } from './utils/socket.js';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';
import authRouter from './routes/auth.routes.js';
import courseRouter from './routes/course.routes.js';
import credentialRouter from './routes/credential.routes.js';
import forumRouter from './routes/forum.routes.js';
import profileRouter from './routes/profile.routes.js';
import uploadRouter from './routes/upload.routes.js';
import statsRouter from './routes/stats.routes.js';

const app = express();
const httpServer = createServer(app);
const io = initSocket(httpServer);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(arcjetMiddleware);

app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.get('/', (_req, res) => {
  res.json({ message: 'Hakia Platform API v1' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/credentials', credentialRouter);
app.use('/api/v1/forum', forumRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/stats', statsRouter);

app.use(errorMiddleware);

httpServer.listen(PORT, () => {
  console.log(`Hakia API running on http://localhost:${PORT}`);
});

export default app;
