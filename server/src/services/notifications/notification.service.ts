import twilio, { Twilio } from 'twilio';
import { loadConfig } from '@config/env';
import logger from '@lib/logger';
import prisma from '@db/client';
import { AppError } from '@lib/errors';

const normalize = (value: string | null | undefined) => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export type SmsContext = {
  dealId?: string | null;
  inboundEmailId?: string | null;
  [key: string]: unknown;
};

export type SmsNotificationPayload = {
  creatorId: string;
  creatorPhoneNumber: string;
  message: string;
  context?: SmsContext;
};

export class NotificationService {
  private readonly client: Twilio | null;

  private readonly messagingServiceSid: string | null;

  private readonly fromNumber: string | null;

  constructor() {
    const config = loadConfig();

    const accountSid = normalize(config.twilio.accountSid);
    const authToken = normalize(config.twilio.authToken);

    this.messagingServiceSid = normalize(config.twilio.messagingServiceSid);
    this.fromNumber = normalize(config.twilio.fromNumber);

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    } else {
      logger.warn('Twilio credentials are not configured. SMS notifications are disabled.');
      this.client = null;
    }
  }

  async sendSms(payload: SmsNotificationPayload) {
    if (!this.client) {
      logger.warn(
        {
          creatorId: payload.creatorId,
          context: payload.context ?? null
        },
        'Skipping SMS notification - Twilio client not initialized'
      );
      return null;
    }

    if (!this.messagingServiceSid && !this.fromNumber) {
      throw new AppError(
        'Twilio messaging service SID or from number must be configured before sending SMS',
        500
      );
    }

    const messageResponse = await this.client.messages.create({
      to: payload.creatorPhoneNumber,
      messagingServiceSid: this.messagingServiceSid ?? undefined,
      from: this.messagingServiceSid ? undefined : this.fromNumber ?? undefined,
      body: payload.message
    });

    await prisma.outboundMessage.create({
      data: {
        creatorId: payload.creatorId,
        dealId: payload.context?.dealId ?? null,
        channel: 'SMS',
        to: payload.creatorPhoneNumber,
        body: payload.message,
        payload: payload.context ? JSON.stringify(payload.context) : null,
        providerMessageId: messageResponse.sid,
        status: 'SENT',
        sentAt: new Date()
      }
    });

    return messageResponse;
  }
}

export const createNotificationService = () => new NotificationService();
