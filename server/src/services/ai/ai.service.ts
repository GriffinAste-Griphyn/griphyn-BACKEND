import OpenAI from 'openai';
import { loadConfig } from '@config/env';
import logger from '@lib/logger';

export type DealInsightRequest = {
  emailSubject?: string | null;
  emailBody?: string | null;
  creatorProfile: {
    name: string;
    niche?: string | null;
    audienceSize?: number | null;
    typicalRate?: number | null;
  };
  brandProfile?: {
    name?: string | null;
    industry?: string | null;
  };
};

export type DealInsightResponse = {
  summary: string;
  classification: 'deal' | 'non_deal' | 'uncertain';
  confidence: number;
  recommendedRateRange?: {
    low: number;
    high: number;
    currency: string;
  };
  suggestedNextSteps: string[];
};

export class AiService {
  private readonly client: OpenAI | null;

  private readonly model = 'gpt-4.1-mini';

  constructor() {
    const config = loadConfig();

    if (!config.openai.apiKey) {
      logger.warn('OpenAI API key is not configured. AI features are disabled.');
      this.client = null;
      return;
    }

    this.client = new OpenAI({
      apiKey: config.openai.apiKey
    });
  }

  async generateDealInsights(request: DealInsightRequest): Promise<DealInsightResponse> {
    if (!this.client) {
      return {
        summary: 'AI summary unavailable - missing API key.',
        classification: 'uncertain',
        confidence: 0,
        suggestedNextSteps: [
          'Review the email manually to confirm whether it is a brand inquiry.',
          'Configure the OPENAI_API_KEY environment variable to enable AI summaries.'
        ]
      };
    }

    logger.info(
      {
        subject: request.emailSubject,
        creator: request.creatorProfile.name
      },
      'Requesting AI deal insights'
    );

    try {
      const creatorProfileSummary = [
        `Name: ${request.creatorProfile.name}`,
        request.creatorProfile.niche ? `Niche: ${request.creatorProfile.niche}` : null,
        typeof request.creatorProfile.audienceSize === 'number'
          ? `Audience size: ${request.creatorProfile.audienceSize}`
          : null,
        typeof request.creatorProfile.typicalRate === 'number'
          ? `Typical rate: ${request.creatorProfile.typicalRate}`
          : null
      ]
        .filter(Boolean)
        .join('\n');

      const brandProfileSummary = request.brandProfile
        ? [
            request.brandProfile.name ? `Name: ${request.brandProfile.name}` : null,
            request.brandProfile.industry ? `Industry: ${request.brandProfile.industry}` : null
          ]
            .filter(Boolean)
            .join('\n')
        : null;

      const response = await this.client.responses.create({
        model: this.model,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text:
                  'You are an AI assistant that reads inbound brand deal emails for content creators. ' +
                  'Return a JSON object describing the opportunity. ' +
                  'Classification must be one of "deal", "non_deal", or "uncertain". ' +
                  'When details are missing, make best-effort inferences and mark confidence accordingly. ' +
                  'All numeric confidence values must be between 0 and 1.'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  request.emailSubject ? `Email Subject: ${request.emailSubject}` : null,
                  request.emailBody ? `Email Body:\n${request.emailBody}` : null,
                  creatorProfileSummary ? `Creator Profile:\n${creatorProfileSummary}` : null,
                  brandProfileSummary ? `Brand Profile:\n${brandProfileSummary}` : null
                ]
                  .filter(Boolean)
                  .join('\n\n')
              }
            ]
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'DealInsight',
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['summary', 'classification', 'confidence', 'suggestedNextSteps'],
              properties: {
                summary: {
                  type: 'string',
                  description:
                    'A concise summary of the opportunity and key points relevant to the creator.'
                },
                classification: {
                  type: 'string',
                  enum: ['deal', 'non_deal', 'uncertain'],
                  description:
                    'Whether the email represents a deal opportunity, a non-deal message, or is uncertain.'
                },
                confidence: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                  description: 'Confidence score for the classification between 0 and 1.'
                },
                recommendedRateRange: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['low', 'high', 'currency'],
                  properties: {
                    low: { type: 'number' },
                    high: { type: 'number' },
                    currency: { type: 'string' }
                  }
                },
                suggestedNextSteps: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        temperature: 0.2
      } as any);

      const firstOutput = response.output?.[0];
      const outputContent =
        firstOutput && firstOutput.type === 'message' ? (firstOutput.content?.[0] as any) : undefined;

      let parsed: DealInsightResponse | null = null;

      if (outputContent?.type === 'json_schema' && outputContent.json_schema?.output) {
        parsed = outputContent.json_schema.output as DealInsightResponse;
      } else if (outputContent?.type === 'output_text' && outputContent.text) {
        parsed = JSON.parse(outputContent.text) as DealInsightResponse;
      }

      if (!parsed) {
        throw new Error('Unable to parse OpenAI response payload');
      }

      const allowedClassifications: DealInsightResponse['classification'][] = [
        'deal',
        'non_deal',
        'uncertain'
      ];

      const cleanedNextSteps =
        Array.isArray(parsed.suggestedNextSteps) && parsed.suggestedNextSteps.length > 0
          ? parsed.suggestedNextSteps.filter(
              (step): step is string => typeof step === 'string' && step.trim().length > 0
            )
          : [];

      const normalized: DealInsightResponse = {
        summary: typeof parsed.summary === 'string' && parsed.summary.trim().length > 0
          ? parsed.summary.trim()
          : 'AI summary unavailable - empty summary returned.',
        classification: allowedClassifications.includes(parsed.classification)
          ? parsed.classification
          : 'uncertain',
        confidence: Math.min(
          1,
          Math.max(0, Number.isFinite(parsed.confidence) ? Number(parsed.confidence) : 0)
        ),
        suggestedNextSteps:
          cleanedNextSteps.length > 0
            ? cleanedNextSteps
            : ['Review the email manually to confirm whether it is a brand inquiry.']
      };

      if (
        parsed.recommendedRateRange &&
        typeof parsed.recommendedRateRange.low === 'number' &&
        typeof parsed.recommendedRateRange.high === 'number' &&
        typeof parsed.recommendedRateRange.currency === 'string'
      ) {
        normalized.recommendedRateRange = {
          low: parsed.recommendedRateRange.low,
          high: parsed.recommendedRateRange.high,
          currency: parsed.recommendedRateRange.currency
        };
      }

      return normalized;
    } catch (error) {
      logger.error(
        {
          err: error instanceof Error ? error : { message: String(error) }
        },
        'Failed to generate AI deal insights'
      );

      return {
        summary: 'AI summary unavailable due to an upstream error.',
        classification: 'uncertain',
        confidence: 0,
        suggestedNextSteps: [
          'Review the email manually to confirm whether it is a brand inquiry.',
          'Retry once AI services are available.'
        ]
      };
    }
  }
}

export const createAiService = () => new AiService();
