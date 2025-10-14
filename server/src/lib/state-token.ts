import crypto from 'crypto';
import { AppError } from '@lib/errors';

const BASE64_URL_SEARCH = /\+/g;
const BASE64_URL_REPLACE = /-/g;

const encodeBase64Url = (input: Buffer | string) =>
  Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(BASE64_URL_SEARCH, '-')
    .replace(/\//g, '_');

const decodeBase64Url = (input: string) => {
  const normalized = input.replace(BASE64_URL_REPLACE, '+').replace(/_/g, '/');
  const padding = 4 - (normalized.length % 4 || 4);
  return Buffer.from(normalized + '='.repeat(padding), 'base64').toString('utf8');
};

export type StateTokenPayload = {
  creatorId: string;
  redirectUri?: string;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

const DEFAULT_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export const createStateToken = (
  payload: Pick<StateTokenPayload, 'creatorId' | 'redirectUri'>,
  secret: string,
  expiresInMs = DEFAULT_EXPIRY_MS
) => {
  if (!secret) {
    throw new AppError('SESSION_SECRET must be configured to sign OAuth state tokens', 500);
  }

  const issuedAt = Date.now();
  const tokenPayload: StateTokenPayload = {
    creatorId: payload.creatorId,
    redirectUri: payload.redirectUri,
    issuedAt,
    expiresAt: issuedAt + Math.max(expiresInMs, 1000),
    nonce: crypto.randomBytes(16).toString('hex')
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(tokenPayload));
  const signature = encodeBase64Url(crypto.createHmac('sha256', secret).update(encodedPayload).digest());

  return `${encodedPayload}.${signature}`;
};

export const verifyStateToken = (token: string, secret: string): StateTokenPayload => {
  if (!token || !secret) {
    throw new AppError('Invalid OAuth state token', 400);
  }

  const [encodedPayload, providedSignature] = token.split('.');

  if (!encodedPayload || !providedSignature) {
    throw new AppError('Malformed OAuth state token', 400);
  }

  const expectedSignature = encodeBase64Url(crypto.createHmac('sha256', secret).update(encodedPayload).digest());

  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (providedBuffer.length !== expectedBuffer.length) {
    throw new AppError('OAuth state signature mismatch', 400);
  }

  if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new AppError('OAuth state signature mismatch', 400);
  }

  const decodedPayload = JSON.parse(decodeBase64Url(encodedPayload)) as StateTokenPayload;

  if (decodedPayload.expiresAt < Date.now()) {
    throw new AppError('OAuth state token has expired', 400);
  }

  return decodedPayload;
};
