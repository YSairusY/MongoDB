import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import router from './routers/index.js';
import { UPLOAD_DIR } from './constants/index.js';

import cookieParser from 'cookie-parser';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', '3000'));

export const setupServer = () => {
  const app = express();

  app.use(express.json());

  // Налаштування CORS з явно вказаним origin
  app.use(
    cors({
      origin: 'https://mongodb-p96a.onrender.com', // заміни на свій фронтенд домен або '*'
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true, // якщо використовуєш кукі
    }),
  );

  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  // Логування заголовків відповіді (для дебагу, можна видалити пізніше)
  app.use((req, res, next) => {
    res.on('finish', () => {
      console.log('Response Headers:', res.getHeaders());
    });
    next();
  });

  // Статичні файли
  app.use('/uploads', express.static(UPLOAD_DIR));

  app.use(router);

  app.use('/api-docs', swaggerDocs());

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
