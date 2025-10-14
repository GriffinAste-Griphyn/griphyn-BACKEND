import { Router } from 'express';
import prisma from '@db/client';
import { z } from 'zod';

const router = Router();

const limitSchema = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => Math.min(Math.max(parseInt(value, 10), 1), 50));

const querySchema = z.object({
  limit: z.union([limitSchema, z.array(limitSchema)]).optional()
});

const paramsSchema = z.object({
  id: z.string().min(1)
});

router.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    const limitValue = parsed.success ? parsed.data.limit : undefined;
    const take = Array.isArray(limitValue) ? limitValue[0] : limitValue ?? 25;

    const deals = await prisma.deal.findMany({
      include: {
        brand: true,
        creator: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take
    });

    res.json({ data: deals });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const parsed = paramsSchema.safeParse(req.params);

    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid deal id' });
      return;
    }

    const { id } = parsed.data;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        brand: true,
        creator: true,
        inboundEmail: true
      }
    });

    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }

    res.json({ data: deal });
  } catch (error) {
    next(error);
  }
});

export default router;
