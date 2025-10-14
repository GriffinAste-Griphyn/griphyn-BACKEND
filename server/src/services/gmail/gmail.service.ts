import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { loadConfig } from '@config/env';
import logger from '@lib/logger';
import { AppError } from '@lib/errors';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly'
];

export type GmailTokens = {
  accessToken: string | null;
  refreshToken: string | null;
  expiryDate?: number | null;
  scope?: string | null;
  tokenType?: string | null;
  idToken?: string | null;
};

export type GmailMetadata = {
  messageId: string;
  threadId: string;
  historyId?: string;
};

export type GmailProfile = {
  emailAddress?: string | null;
  historyId?: string | null;
  messagesTotal?: number | null;
  threadsTotal?: number | null;
};

type OAuthCredentials = {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiryDate?: number | null;
  scope?: string | null;
  tokenType?: string | null;
};

export type GmailStoredCredential = {
  accessToken: string | null;
  refreshToken: string;
  expiryDate: Date | null;
  scope?: string | null;
  tokenType?: string | null;
};

export class GmailService {
  private readonly config = loadConfig();

  private readonly baseClient: OAuth2Client;

  constructor() {
    if (!this.config.google.clientId || !this.config.google.clientSecret || !this.config.google.redirectUri) {
      throw new AppError('Google OAuth credentials are not configured', 500);
    }

    this.baseClient = new google.auth.OAuth2(
      this.config.google.clientId ?? undefined,
      this.config.google.clientSecret ?? undefined,
      this.config.google.redirectUri ?? undefined
    );
  }

  private createOAuthClient(credentials?: OAuthCredentials) {
    const client = new google.auth.OAuth2(
      this.config.google.clientId ?? undefined,
      this.config.google.clientSecret ?? undefined,
      this.config.google.redirectUri ?? undefined
    );

    if (credentials) {
      client.setCredentials({
        access_token: credentials.accessToken ?? undefined,
        refresh_token: credentials.refreshToken ?? undefined,
        expiry_date: credentials.expiryDate ?? undefined,
        scope: credentials.scope ?? undefined,
        token_type: credentials.tokenType ?? undefined
      });
    }

    return client;
  }

  getAuthorizationUrl(state?: string) {
    const url = this.baseClient.generateAuthUrl({
      access_type: 'offline',
      scope: GMAIL_SCOPES,
      prompt: 'consent',
      include_granted_scopes: true,
      state
    });

    return url;
  }

  async exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    const { tokens } = await this.baseClient.getToken(code);

    return {
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope,
      tokenType: tokens.token_type,
      idToken: tokens.id_token ?? null
    };
  }

  async getUserProfile(tokens: GmailTokens): Promise<GmailProfile> {
    const client = this.createOAuthClient({
      accessToken: tokens.accessToken ?? undefined,
      refreshToken: tokens.refreshToken ?? undefined,
      expiryDate: tokens.expiryDate ?? undefined,
      scope: tokens.scope ?? undefined,
      tokenType: tokens.tokenType ?? undefined
    });

    if (!tokens.accessToken && tokens.refreshToken) {
      await client.getAccessToken();
    }

    const gmail = google.gmail({ version: 'v1', auth: client });
    const response = await gmail.users.getProfile({ userId: 'me' });

    return {
      emailAddress: response.data.emailAddress ?? null,
      historyId: response.data.historyId ?? null,
      messagesTotal: response.data.messagesTotal ?? null,
      threadsTotal: response.data.threadsTotal ?? null
    };
  }

  async getAuthorizedGmailClient(credential: GmailStoredCredential) {
    const client = this.createOAuthClient({
      accessToken: credential.accessToken ?? undefined,
      refreshToken: credential.refreshToken,
      expiryDate: credential.expiryDate ? credential.expiryDate.getTime() : undefined,
      scope: credential.scope ?? undefined,
      tokenType: credential.tokenType ?? undefined
    });

    await client.getAccessToken();

    const gmail = google.gmail({ version: 'v1', auth: client });
    return { gmail, client };
  }

  // Placeholder for Gmail watch registration.
  async registerWatch(_refreshToken: string) {
    logger.info('Registering Gmail watch - implementation pending');
  }

  // Placeholder for parsing Gmail Pub/Sub message payloads.
  async parsePubSubNotification(_encodedMessage: string): Promise<GmailMetadata | null> {
    logger.info('Parsing Gmail Pub/Sub notification - implementation pending');
    return null;
  }
}

export const createGmailService = () => new GmailService();
