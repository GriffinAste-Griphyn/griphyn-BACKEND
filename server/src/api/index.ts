import { Router } from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import dealsRouter from './routes/deals';
import webhooksRouter from './routes/webhooks';

const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/deals', dealsRouter);
apiRouter.use('/webhooks', webhooksRouter);

export default apiRouter;
