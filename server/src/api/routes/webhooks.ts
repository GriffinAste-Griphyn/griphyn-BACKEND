import { Router } from 'express';
import twilio from 'twilio';
import prisma from '@db/client';
import logger from '@lib/logger';

const router = Router();

router.post('/gmail', (req, res) => {
  logger.info({ body: req.body }, 'Received Gmail webhook payload');
  res.status(202).json({ received: true });
});

const normalizePhoneNumber = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const startsWithPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D+/g, '');

  if (digitsOnly.length === 0) {
    return null;
  }

  if (startsWithPlus) {
    return `+${digitsOnly}`;
  }

  return `+${digitsOnly}`;
};

router.post('/twilio', async (req, res, next) => {
  try {
    const from = typeof req.body.From === 'string' ? req.body.From.trim() : null;
    const body = typeof req.body.Body === 'string' ? req.body.Body.trim() : '';

    if (!from) {
      logger.warn({ body: req.body }, 'Twilio webhook missing "From" number');
      res.status(400).json({ error: { message: 'Missing sender phone number' } });
      return;
    }

    const normalizedFrom = normalizePhoneNumber(from);

    if (!normalizedFrom) {
      logger.warn({ from }, 'Unable to normalize inbound phone number');
      res.status(400).json({ error: { message: 'Invalid sender phone number' } });
      return;
    }

    const phoneCandidates = [normalizedFrom, normalizedFrom.slice(1)];

    logger.info(
      {
        rawFrom: from,
        normalizedFrom,
        phoneCandidates
      },
      'Processing inbound Twilio webhook'
    );

    const creator = await prisma.creator.findFirst({
      where: {
        phoneNumber: {
          in: phoneCandidates
        }
      }
    });

    if (!creator) {
      logger.warn({ from: normalizedFrom }, 'Received SMS from unknown number');
      const response = new twilio.twiml.MessagingResponse();
      response.message("We couldn't match your number to a creator account. Please contact support.");
      res.type('text/xml').send(response.toString());
      return;
    }

    const pendingDeal = await prisma.deal.findFirst({
      where: {
        creatorId: creator.id,
        status: 'PENDING_CREATOR',
        source: 'EMAIL'
      },
      include: {
        inboundEmail: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!pendingDeal || !pendingDeal.inboundEmail) {
      logger.info({ creatorId: creator.id }, 'No pending deal awaiting creator confirmation');
      const response = new twilio.twiml.MessagingResponse();
      response.message('No pending deals found. We will notify you when new opportunities arrive.');
      res.type('text/xml').send(response.toString());
      return;
    }
    logger.info(
      {
        creatorId: creator.id,
        pendingDealId: pendingDeal.id,
        status: pendingDeal.status,
        dealSource: pendingDeal.source
      },
      'Matched pending deal for creator reply'
    );

    const pendingEmail = pendingDeal.inboundEmail;

    const lowerBody = body.toLowerCase();
    const normalizedBody = lowerBody.replace(/[^a-z0-9+]+/g, ' ').trim();
    const isAffirmative =
      normalizedBody === 'yes' ||
      normalizedBody === 'y' ||
      normalizedBody === 'accept' ||
      normalizedBody.startsWith('yes ') ||
      normalizedBody.startsWith('y ') ||
      normalizedBody.startsWith('ok') ||
      normalizedBody.includes('👍');
    const isNegotiate =
      normalizedBody === 'negotiate' ||
      normalizedBody === 'negotiation' ||
      normalizedBody.startsWith('negotiate ') ||
      normalizedBody.startsWith('neg ');
    const isNegative =
      normalizedBody === 'no' ||
      normalizedBody === 'n' ||
      normalizedBody === 'reject' ||
      normalizedBody === 'decline' ||
      normalizedBody.startsWith('no ') ||
      normalizedBody.startsWith('n ');

    const response = new twilio.twiml.MessagingResponse();

    if (!isAffirmative && !isNegotiate && !isNegative) {
      response.message(
        'Reply YES to accept, NEGOTIATE to discuss terms, or REJECT to skip this opportunity.'
      );
      res.type('text/xml').send(response.toString());
      return;
    }

    let parsedData: { aiInsight?: Record<string, unknown>; bodyText?: string } | null = null;
    if (pendingEmail.parsedData) {
      try {
        parsedData = JSON.parse(pendingEmail.parsedData) as { aiInsight?: Record<string, unknown>; bodyText?: string };
      } catch (error) {
        logger.warn({ err: error }, 'Failed to parse inbound email parsedData JSON');
      }
    }

    const aiInsight = parsedData?.aiInsight ?? {};
    const summary =
      (aiInsight && typeof aiInsight.summary === 'string' ? (aiInsight.summary as string) : null) ??
      pendingEmail.snippet ??
      pendingEmail.subject ??
      'New brand opportunity';

    const confidence =
      aiInsight && typeof aiInsight.confidence === 'number' ? (aiInsight.confidence as number) : null;

    if (isNegative) {
      await prisma.deal.update({
        where: { id: pendingDeal.id },
        data: {
          status: 'UNQUALIFIED'
        }
      });

      await prisma.inboundEmail.update({
        where: { id: pendingEmail.id },
        data: {
          classification: 'DEAL_UNQUALIFIED'
        }
      });

      response.message('Understood. This opportunity has been marked as unqualified.');
      res.type('text/xml').send(response.toString());
      return;
    }

    if (isNegotiate) {
      await prisma.deal.update({
        where: { id: pendingDeal.id },
        data: {
          status: 'NEGOTIATION',
          aiSummary: typeof aiInsight.summary === 'string' ? (aiInsight.summary as string) : pendingDeal.aiSummary,
          aiConfidence: confidence ?? pendingDeal.aiConfidence,
          summary
        }
      });

      await prisma.inboundEmail.update({
        where: { id: pendingEmail.id },
        data: {
          classification: 'DEAL_NEGOTIATE_BY_CREATOR'
        }
      });

      response.message(`Great! We'll let the brand know you're open to negotiating "${pendingDeal.title ?? 'this deal'}".`);
      res.type('text/xml').send(response.toString());
      return;
    }

    // Affirmative path
    await prisma.deal.update({
      where: { id: pendingDeal.id },
      data: {
        status: 'ACTIVE',
        aiSummary: typeof aiInsight.summary === 'string' ? (aiInsight.summary as string) : pendingDeal.aiSummary,
        aiConfidence: confidence ?? pendingDeal.aiConfidence,
        summary
      }
    });

    await prisma.inboundEmail.update({
      where: { id: pendingEmail.id },
      data: {
        classification: 'DEAL_CONFIRMED_BY_CREATOR'
      }
    });

    response.message(`Great! "${pendingDeal.title ?? 'New deal'}" is confirmed. We'll follow up with next steps.`);
    res.type('text/xml').send(response.toString());
  } catch (error) {
    next(error);
  }
});

export default router;
