import 'dotenv/config';
import type { gmail_v1 } from 'googleapis';
import prisma from '@db/client';
import logger from '@lib/logger';
import { createGmailService } from '@services/gmail/gmail.service';
import { createAiService } from '@services/ai/ai.service';
import { createNotificationService } from '@services/notifications/notification.service';

type MessageHeader = {
  name?: string | null;
  value?: string | null;
};

type CredentialMetadata = {
  historyId?: string | null;
  lastHistoryId?: string | null;
  messagesTotal?: number | null;
  threadsTotal?: number | null;
  [key: string]: unknown;
};

const DEAL_KEYWORDS = /sponsor|brand|partnership|collab|offer|campaign|promotion|advert/i;

const gmailService = createGmailService();
const aiService = createAiService();
const notificationService = createNotificationService();

type ParsedDealDetails = {
  budget?: string | null;
  deliverables?: string | null;
  dueDate?: string | null;
};

const decodeBase64Url = (input: string | undefined | null) => {
  if (!input) return '';
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (normalized.length % 4 || 4);
  return Buffer.from(normalized + '='.repeat(padding), 'base64').toString('utf8');
};

const extractPlainTextBody = (payload?: gmail_v1.Schema$MessagePart | null): string => {
  if (!payload) return '';

  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      const text = extractPlainTextBody(part);
      if (text) {
        return text;
      }
    }
  }

  return decodeBase64Url(payload.body?.data);
};

const headersToMap = (headers: MessageHeader[] = []) => {
  const map = new Map<string, string>();
  headers.forEach((header) => {
    if (header?.name && header.value) {
      map.set(header.name.toLowerCase(), header.value);
    }
  });
  return map;
};

const shouldTreatAsDeal = (subject?: string | null, body?: string) => {
  const haystack = [subject ?? '', body ?? ''].join(' ');
  return DEAL_KEYWORDS.test(haystack);
};

const parseBrandName = (subject: string, fromAddress: string) => {
  const match = subject.match(/-\s*([^-]+)$/);
  if (match?.[1]) {
    return match[1].trim();
  }

  const angleMatch = fromAddress.match(/["']?([^"<']+)["']?\s*<.+>/);
  if (angleMatch?.[1]) {
    return angleMatch[1].trim();
  }

  return subject.trim() || fromAddress;
};

const formatBudgetToken = (rawToken: string) => {
  const token = rawToken.replace(/\s+/g, '').toLowerCase();
  const currencySymbolMatch = rawToken.trim().match(/^([$£€])/);
  const currencySymbol = currencySymbolMatch ? currencySymbolMatch[1] : '$';

  const numericMatch = token.match(/^[$£€]?([0-9]+(?:[.,][0-9]+)*)?(k|m|million|thousand)?$/i);
  if (!numericMatch || !numericMatch[1]) {
    const fallback = rawToken.trim();
    return fallback.startsWith('$') ? fallback : `$${fallback}`;
  }

  const baseValue = parseFloat(numericMatch[1].replace(/,/g, ''));
  if (Number.isNaN(baseValue)) {
    const fallback = rawToken.trim();
    return fallback.startsWith('$') ? fallback : `$${fallback}`;
  }

  const suffix = numericMatch[2]?.toLowerCase() ?? '';
  let multiplier = 1;
  if (suffix === 'k' || suffix === 'thousand') {
    multiplier = 1_000;
  } else if (suffix === 'm' || suffix === 'million') {
    multiplier = 1_000_000;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(baseValue * multiplier);

  return `${currencySymbol}${formatted}`;
};

const findBudgetToken = (body: string) => {
  const budgetPatterns: Array<RegExp> = [
    /budget\s*(?:[:\-]|is|=)?\s*([$£€]?\s*[0-9][0-9,\.]*(?:\s?(?:k|m|million|thousand))?)/i,
    /(?:budgeted\s+at|priced\s+at|rate\s+of|for)\s+([$£€]?\s*[0-9][0-9,\.]*(?:\s?(?:k|m|million|thousand))?)/i
  ];

  for (const pattern of budgetPatterns) {
    const match = pattern.exec(body);
    if (match?.[1]) {
      const startOffset = match.index + match[0].indexOf(match[1]);
      return { formatted: formatBudgetToken(match[1]), endIndex: startOffset + match[1].length };
    }
  }

  const fallbackCurrency = [...body.matchAll(/([$£€]\s*[0-9][0-9,\.]*(?:\s?(?:k|m|million|thousand))?)/gi)];
  for (const match of fallbackCurrency) {
    if (!match[1]) continue;
    const prefix = body.slice(Math.max(0, match.index - 30), match.index).toLowerCase();
    if (/(deal|offer|budget|rate|pay|for|payment|proposal)/.test(prefix)) {
      return {
        formatted: formatBudgetToken(match[1]),
        endIndex: match.index + match[1].length
      };
    }
  }

  return null;
};

const sanitizeTextFragment = (input: string | null | undefined) =>
  input ? input.replace(/\s+/g, ' ').replace(/\.\s*$/, '').trim() : null;

const findDeliverables = (body: string, budgetEndIndex: number | null) => {
  const deliverablesPatterns: Array<RegExp> = [
    /deliverables?\s*(?:[:\-]|include[s]?|are)?\s*([^\n\r]+)/i,
    /deliverable\s*(?:[:\-]|include[s]?|are)?\s*([^\n\r]+)/i
  ];

  for (const pattern of deliverablesPatterns) {
    const match = pattern.exec(body);
    if (match?.[1]) {
      return sanitizeTextFragment(match[1]);
    }
  }

  const searchStart = typeof budgetEndIndex === 'number' ? budgetEndIndex : 0;
  const fallbackBody = body.slice(searchStart);
  const fallbackMatch = fallbackBody.match(
    /(?:for|including|with|asking for)\s+((?!\$)[^.]{3,120}?(?:posts?|videos?|stories?|deliverables?|assets?|placements?|mentions?|spots?|campaigns?))/i
  );

  if (fallbackMatch?.[1]) {
    return sanitizeTextFragment(fallbackMatch[1]);
  }

  return null;
};

const findDueDate = (body: string) => {
  const datePatterns: Array<RegExp> = [
    /due\s*(?:date)?\s*(?:[:\-]|is|on|by)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /due\s*(?:date)?\s*(?:[:\-]|is|on|by)?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /deadline\s*(?:[:\-]|is|on|by)?\s*(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /deadline\s*(?:[:\-]|is|on|by)?\s*([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i,
    /by\s+(\d{1,2}\/\d{1,2}\/\d{2,4})/i,
    /by\s+([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4})/i
  ];

  for (const pattern of datePatterns) {
    const match = pattern.exec(body);
    if (match?.[1]) {
      return sanitizeTextFragment(match[1]);
    }
  }

  return null;
};

const extractDealDetails = (body: string): ParsedDealDetails => {
  const budgetResult = findBudgetToken(body);
  const deliverables = findDeliverables(body, budgetResult?.endIndex ?? null);
  const dueDate = findDueDate(body);

  return {
    budget: budgetResult?.formatted ?? null,
    deliverables,
    dueDate
  };
};

const buildSmsBody = ({
  brandName,
  subject,
  fromAddress,
  details
}: {
  brandName: string;
  subject: string;
  fromAddress: string;
  details: ParsedDealDetails;
}) => {
  const parts: string[] = [];

  if (details.budget) {
    parts.push(`Budget ${details.budget}`);
  }

  if (details.deliverables) {
    parts.push(`Deliverables: ${details.deliverables}`);
  }

  if (details.dueDate) {
    parts.push(`Due ${details.dueDate}`);
  }

  const detailSentence = parts.length > 0 ? `${parts.join('. ')}.` : '';
  const detailSuffix = detailSentence ? `${detailSentence} ` : '';

  const intro = brandName
    ? `New brand deal from ${brandName}`
    : `New brand inquiry: "${subject}" from ${fromAddress}`;

  return `${intro}. ${detailSuffix}Reply YES to accept, or NEGOTIATE to discuss terms, or REJECT to pass.`.replace(
    /\s+/g,
    ' '
  ).trim();
};

const parseCredentialMetadata = (raw: string | null | undefined): CredentialMetadata => {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      historyId: typeof parsed.historyId === 'string' ? parsed.historyId : null,
      lastHistoryId: typeof parsed.lastHistoryId === 'string' ? parsed.lastHistoryId : null,
      messagesTotal: typeof parsed.messagesTotal === 'number' ? parsed.messagesTotal : null,
      threadsTotal: typeof parsed.threadsTotal === 'number' ? parsed.threadsTotal : null,
      ...parsed
    };
  } catch {
    return {};
  }
};

const maxHistoryId = (a: string | null | undefined, b: string | null | undefined) => {
  if (!a) return b ?? null;
  if (!b) return a ?? null;
  try {
    return BigInt(b) > BigInt(a) ? b : a;
  } catch {
    return b ?? null;
  }
};

const serializeMetadata = (metadata: CredentialMetadata) => JSON.stringify(metadata);

async function processNewMessages() {
  const credential = await prisma.gmailCredential.findFirst({
    include: { creator: true }
  });

  if (!credential) {
    logger.warn('No Gmail credentials detected. Connect a creator inbox first.');
    return;
  }

  logger.info(
    {
      credentialId: credential.id,
      creatorId: credential.creatorId,
      creatorEmail: credential.creator.email
    },
    'Starting Gmail polling run'
  );

  const { gmail, client } = await gmailService.getAuthorizedGmailClient({
    accessToken: credential.accessToken,
    refreshToken: credential.refreshToken,
    expiryDate: credential.expiryDate,
    scope: credential.scope ?? undefined,
    tokenType: credential.tokenType ?? undefined
  });

  const metadata = parseCredentialMetadata(credential.metadata);
  let startHistoryId = metadata.lastHistoryId ?? metadata.historyId ?? null;
  const messageQueue: string[] = [];
  const seenMessageIds = new Set<string>();
  let latestHistoryId: string | null = startHistoryId;

  if (startHistoryId) {
    try {
      let pageToken: string | undefined;
      do {
        const historyResponse = await gmail.users.history.list({
          userId: 'me',
          startHistoryId,
          historyTypes: ['messageAdded'],
          pageToken,
          maxResults: 100
        });

        const historyItems = historyResponse.data.history ?? [];
        for (const historyItem of historyItems) {
          latestHistoryId = maxHistoryId(latestHistoryId, historyItem.id);
          const messagesAdded = historyItem.messagesAdded ?? [];
          for (const added of messagesAdded) {
            const id = added.message?.id;
            if (id && !seenMessageIds.has(id)) {
              seenMessageIds.add(id);
              messageQueue.push(id);
            }
          }
        }

        if (historyResponse.data.historyId) {
          latestHistoryId = maxHistoryId(latestHistoryId, historyResponse.data.historyId);
        }

        pageToken = historyResponse.data.nextPageToken ?? undefined;
      } while (pageToken);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number }; code?: string }).response?.status;
      if (status === 404) {
        logger.warn('Stored Gmail historyId is no longer valid. Falling back to recent inbox messages.');
        startHistoryId = null;
        latestHistoryId = null;
      } else {
        throw error;
      }
    }
  }

  if (!startHistoryId && messageQueue.length === 0) {
    const fallbackResponse = await gmail.users.messages.list({
      userId: 'me',
      labelIds: ['INBOX'],
      maxResults: 10,
      q: 'newer_than:7d'
    });
    const fallbackMessages = fallbackResponse.data.messages ?? [];
    for (const message of fallbackMessages.reverse()) {
      if (message.id && !seenMessageIds.has(message.id)) {
        seenMessageIds.add(message.id);
        messageQueue.push(message.id);
      }
    }
  }

  if (messageQueue.length === 0) {
    logger.info('No new Gmail messages to process.');
  }

  if (messageQueue.length > 0) {
    logger.info({ messageCount: messageQueue.length }, 'Processing Gmail message queue');
  }

  for (const messageId of messageQueue) {
    const existing = await prisma.inboundEmail.findUnique({
      where: { gmailMessageId: messageId }
    });
    if (existing) {
      logger.debug({ gmailMessageId: messageId }, 'Skipping already ingested Gmail message');
      continue;
    }

    let fullMessage: gmail_v1.Schema$Message;
    try {
      const response = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'FULL'
      });
      fullMessage = response.data;
    } catch (error) {
      const status = (error as { response?: { status?: number }; code?: string }).response?.status;
      if (status === 404) {
        logger.warn(
          { gmailMessageId: messageId },
          'Skipping Gmail message - Google returned 404 (possibly deleted or already archived)'
        );
        continue;
      }
      throw error;
    }

    latestHistoryId = maxHistoryId(latestHistoryId, fullMessage.historyId ?? null);

    const payload = fullMessage.payload;
    const headers = headersToMap(payload?.headers as MessageHeader[]);

    const subject = headers.get('subject') ?? '(no subject)';
    const fromAddress = headers.get('from') ?? 'unknown';
    const toAddress = headers.get('to') ?? credential.creator.email;
    const ccAddresses = headers.get('cc') ?? null;
    const bodyText = extractPlainTextBody(payload);

    const isDealByHeuristic = shouldTreatAsDeal(subject, bodyText);
    const aiInsight = await aiService.generateDealInsights({
      emailSubject: subject,
      emailBody: bodyText,
      creatorProfile: {
        name: credential.creator.displayName,
        niche: credential.creator.preferences ?? undefined,
        audienceSize: null,
        typicalRate: null
      },
      brandProfile: {
        name: fromAddress
      }
    });

    const isDealCandidate = isDealByHeuristic || aiInsight.classification === 'deal';
    const classification = isDealCandidate ? 'DEAL_PENDING_CREATOR' : 'NON_DEAL';
    const summary = aiInsight.summary;
    const parsedDetails = extractDealDetails(bodyText);
    const brandName = parseBrandName(subject, fromAddress);

    logger.info(
      {
        gmailMessageId: messageId,
        subject,
        isDealByHeuristic,
        aiClassification: aiInsight.classification,
        confidence: aiInsight.confidence,
        isDealCandidate
      },
      'Evaluated Gmail message'
    );

    const inboundEmail = await prisma.inboundEmail.create({
      data: {
        gmailMessageId: messageId,
        gmailThreadId: fullMessage.threadId ?? null,
        subject,
        snippet: fullMessage.snippet ?? summary,
        fromAddress,
        toAddress,
        ccAddresses,
        bccAddresses: null,
        receivedAt: new Date(Number(fullMessage.internalDate ?? Date.now())),
        rawPayload: JSON.stringify(fullMessage),
        parsedData: JSON.stringify({
          bodyText,
          aiInsight,
          parsedDetails
        }),
        classification,
        classificationConfidence: aiInsight.confidence,
        processedAt: new Date(),
        creatorId: credential.creatorId
      }
    });

    if (isDealCandidate) {
      const deal = await prisma.deal.create({
        data: {
          creatorId: credential.creatorId,
          inboundEmailId: inboundEmail.id,
          title: subject,
          summary,
          status: 'PENDING_CREATOR',
          source: 'EMAIL',
          aiConfidence: aiInsight.confidence,
          aiSummary: summary,
          metadata: JSON.stringify(aiInsight)
        }
      });

      if (credential.creator.phoneNumber) {
        const smsBody = buildSmsBody({
          brandName,
          subject,
          fromAddress,
          details: parsedDetails
        });
        await notificationService.sendSms({
          creatorId: credential.creatorId,
          creatorPhoneNumber: credential.creator.phoneNumber,
          message: smsBody,
          context: {
            inboundEmailId: inboundEmail.id,
            dealId: deal.id
          }
        });
        logger.info(
          {
            creatorId: credential.creatorId,
            dealId: deal.id,
            inboundEmailId: inboundEmail.id
          },
          'Queued SMS notification for new deal'
        );
      } else {
        logger.warn(
          {
            creatorId: credential.creatorId
          },
          'Creator missing phone number. Skipping SMS notification.'
        );
      }
    } else {
      logger.info(
        {
          subject,
          fromAddress,
          classification
        },
        'Inbound email classified as non-deal'
      );
    }

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const nextHistoryId = profile.data.historyId ?? null;

  const nextMetadata: CredentialMetadata = {
    ...metadata,
    historyId: profile.data.historyId ?? metadata.historyId ?? null,
    lastHistoryId: maxHistoryId(latestHistoryId, nextHistoryId) ?? metadata.lastHistoryId ?? null,
    messagesTotal: typeof profile.data.messagesTotal === 'number' ? profile.data.messagesTotal : metadata.messagesTotal ?? null,
    threadsTotal: typeof profile.data.threadsTotal === 'number' ? profile.data.threadsTotal : metadata.threadsTotal ?? null
  };

  await prisma.gmailCredential.update({
    where: { id: credential.id },
    data: {
      metadata: serializeMetadata(nextMetadata)
    }
  });

  const updatedCredentials = client.credentials;
  const nextAccessToken = updatedCredentials.access_token ?? null;
  const nextRefreshToken = updatedCredentials.refresh_token ?? credential.refreshToken;
  const nextExpiry = updatedCredentials.expiry_date
    ? new Date(updatedCredentials.expiry_date)
    : credential.expiryDate;

  const tokensChanged =
    nextAccessToken !== credential.accessToken ||
    nextRefreshToken !== credential.refreshToken ||
    ((nextExpiry?.getTime() ?? null) !== (credential.expiryDate?.getTime() ?? null));

  if (tokensChanged) {
    await prisma.gmailCredential.update({
      where: { id: credential.id },
      data: {
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
        expiryDate: nextExpiry ?? null
      }
    });
  }
}

async function main() {
  try {
    await processNewMessages();
  } catch (error) {
    logger.error({ err: error }, 'Gmail polling worker failed');
  } finally {
    await prisma.$disconnect();
  }
}

void main();
