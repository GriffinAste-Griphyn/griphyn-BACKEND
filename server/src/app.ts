import cors from 'cors';
import express from 'express';
import pinoHttp from 'pino-http';
import apiRouter from '@api/index';
import authRouter from '@api/routes/auth';
import { notFoundHandler } from '@middleware/not-found';
import { errorHandler } from '@middleware/error-handler';
import logger from '@lib/logger';

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(
  express.json({
    limit: '2mb'
  })
);
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use(
  pinoHttp({
    logger,
    autoLogging: true,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    }
  })
);

app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api', apiRouter);
app.use('/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);


export default app;
