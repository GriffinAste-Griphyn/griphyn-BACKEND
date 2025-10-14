import { Router } from 'express';
import { z } from 'zod';
import prisma from '@db/client';
import { createGmailService } from '@services/gmail/gmail.service';
import { AppError, ValidationError } from '@lib/errors';
import { createStateToken, verifyStateToken } from '@lib/state-token';
import { loadConfig } from '@config/env';
import logger from '@lib/logger';

const router = Router();

const googleAuthQuerySchema = z.object({
  creatorId: z.string().uuid('creatorId must be a valid UUID'),
  redirectUri: z
    .string()
    .url('redirectUri must be a valid URL')
    .optional()
});

router.get('/google', async (req, res, next) => {
  try {
    const parsed = googleAuthQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid Google auth request', parsed.error.flatten().fieldErrors);
    }

    const { creatorId, redirectUri } = parsed.data;

    const creator = await prisma.creator.findUnique({
      where: { id: creatorId }
    });

    if (!creator) {
      throw new AppError(`Creator ${creatorId} not found`, 404);
    }

    const config = loadConfig();
    if (!config.sessionSecret) {
      throw new AppError('SESSION_SECRET must be set before initiating OAuth', 500);
    }

    const state = createStateToken({ creatorId, redirectUri }, config.sessionSecret);
    const gmailService = createGmailService();
    const authorizationUrl = gmailService.getAuthorizationUrl(state);

    res.json({
      authorizationUrl,
      state
    });
  } catch (error) {
    next(error);
  }
});

const googleCallbackSchema = z.object({
  code: z.string().min(1, 'Missing authorization code'),
  state: z.string().min(1, 'Missing state token'),
  scope: z.string().optional()
});

router.get('/google/callback', async (req, res, next) => {
  const config = loadConfig();
  let redirectBase: string | null = null;

  try {
    const parsed = googleCallbackSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError('Invalid OAuth callback payload', parsed.error.flatten().fieldErrors);
    }

    if (!config.sessionSecret) {
      throw new AppError('SESSION_SECRET must be configured before handling OAuth callbacks', 500);
    }

    const { code, state } = parsed.data;
    const statePayload = verifyStateToken(state, config.sessionSecret);

    redirectBase = statePayload.redirectUri ?? config.publicWebAppUrl ?? null;

    const creator = await prisma.creator.findUnique({
      where: { id: statePayload.creatorId }
    });

    if (!creator) {
      throw new AppError('Creator not found for OAuth callback', 404);
    }

    const gmailService = createGmailService();
    const tokens = await gmailService.exchangeCodeForTokens(code);

    const existingCredential = await prisma.gmailCredential.findUnique({
      where: { creatorId: creator.id }
    });

    const refreshToken = tokens.refreshToken ?? existingCredential?.refreshToken;
    if (!refreshToken) {
      throw new AppError(
        'Google did not return a refresh token. Ask the user to remove app access and retry.',
        400
      );
    }

    const profile = await gmailService.getUserProfile({
      ...tokens,
      refreshToken
    });

    const nextMetadata = JSON.stringify({
      historyId: profile.historyId,
      lastHistoryId: profile.historyId,
      messagesTotal: profile.messagesTotal,
      threadsTotal: profile.threadsTotal
    });

    await prisma.gmailCredential.upsert({
      where: { creatorId: creator.id },
      create: {
        creatorId: creator.id,
        googleUserId: profile.emailAddress ?? creator.googleUserId ?? creator.email,
        email: profile.emailAddress ?? creator.email,
        accessToken: tokens.accessToken,
        refreshToken,
        scope: tokens.scope ?? existingCredential?.scope ?? null,
        tokenType: tokens.tokenType ?? existingCredential?.tokenType ?? null,
        expiryDate: tokens.expiryDate ? new Date(tokens.expiryDate) : existingCredential?.expiryDate ?? null,
        metadata: nextMetadata
      },
      update: {
        googleUserId:
          profile.emailAddress ?? existingCredential?.googleUserId ?? creator.googleUserId ?? undefined,
        email: profile.emailAddress ?? existingCredential?.email ?? creator.email,
        accessToken: tokens.accessToken,
        refreshToken,
        scope: tokens.scope ?? existingCredential?.scope ?? null,
        tokenType: tokens.tokenType ?? existingCredential?.tokenType ?? null,
        expiryDate: tokens.expiryDate ? new Date(tokens.expiryDate) : existingCredential?.expiryDate ?? null,
        metadata: nextMetadata
      }
    });

    await prisma.creator.update({
      where: { id: creator.id },
      data: {
        gmailAddress: profile.emailAddress ?? creator.gmailAddress,
        googleUserId: profile.emailAddress ?? creator.googleUserId ?? creator.email,
        status: 'ACTIVE'
      }
    });

    logger.info(
      {
        creatorId: creator.id,
        gmailAddress: profile.emailAddress
      },
      'Creator Gmail account connected successfully'
    );

    if (redirectBase) {
      const successUrl = new URL(redirectBase);
      successUrl.searchParams.set('integration', 'gmail');
      successUrl.searchParams.set('status', 'success');
      successUrl.searchParams.set('creatorId', creator.id);
      res.redirect(successUrl.toString());
      return;
    }

    res.json({
      status: 'success',
      creatorId: creator.id,
      gmailAddress: profile.emailAddress
    });
  } catch (error) {
    logger.error({ err: error }, 'Error handling Google OAuth callback');

    if (redirectBase) {
      try {
        const failureUrl = new URL(redirectBase);
        failureUrl.searchParams.set('integration', 'gmail');
        failureUrl.searchParams.set('status', 'error');
        failureUrl.searchParams.set('message', error instanceof Error ? error.message : 'OAuth failed');
        res.redirect(failureUrl.toString());
        return;
      } catch {
        // fall through to default error handling
      }
    }

    next(error);
  }
});

export default router;
