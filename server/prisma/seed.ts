import prisma from '../src/db/client';

type SampleDeal = {
  id: string;
  title: string;
  summary: string;
  status: string;
  source: string;
  estimatedValue: number;
  currencyCode: string;
  dueDate: string;
  createdAt: string;
  brand: {
    name: string;
    domain: string;
    contactEmail: string;
    website?: string | null;
  };
  aiSummary: string;
  metadata: Record<string, unknown>;
};

const SAMPLE_DEALS: SampleDeal[] = [
  {
    id: 'sample-nike',
    title: 'New Brand Deal - Nike',
    summary:
      "Launch Nike's fall training collection with high-energy social content highlighting comfort and performance.",
    status: 'PENDING_CREATOR',
    source: 'EMAIL',
    estimatedValue: 15000,
    currencyCode: 'USD',
    dueDate: '2025-11-15T00:00:00.000Z',
    createdAt: '2025-10-10T20:05:00.000Z',
    brand: {
      name: 'Nike',
      domain: 'nike.com',
      contactEmail: 'partnerships@nike.example',
      website: 'https://www.nike.com'
    },
    aiSummary:
      'High-value inbound Nike partnership featuring reels and TikTok assets promoting the fall training collection.',
    metadata: {
      usageRights: 'Organic',
      paymentStatus: 'Awaiting Payment',
      deliverables: '2 Instagram Reels, 1 TikTok',
      campaign: 'New Brand Deal - Nike',
      objective:
        "Launch Nike's fall training collection with high-energy social content highlighting comfort and performance.",
      timeline: 'Content due by Nov 5, 2025. Posting window Nov 10-20, 2025',
      brandGuidelines: 'Energetic tone, showcase movement, use Nike brand colors and #JustDoIt',
      talkingPoints: [
        'New fall training collection',
        'Breathable fabric technology',
        'Limited seasonal colorways'
      ],
      hashtags: '#NikePartner #FallTraining #JustDoIt',
      deliverablesList: [
        { type: 'Instagram Reels', count: 2, specs: '45-60 seconds, vertical (9:16), include CTA' },
        { type: 'TikTok Video', count: 1, specs: '30 seconds, highlight key product features' }
      ],
      agentTimeline: [
        {
          timestamp: '2025-10-10 8:05 PM',
          action: 'Deal Created',
          details: 'Inbound inquiry detected from Nike partnerships team',
          rationale: "High-value brand aligned with creator's athletic niche"
        },
        {
          timestamp: '2025-10-10 8:10 PM',
          action: 'Initial Review',
          details: 'AI classified message as deal opportunity and drafted summary',
          rationale: 'Email references partnership terms and deliverables'
        }
      ]
    }
  },
  {
    id: 'sample-nova-reels',
    title: 'Spring Launch Sponsored Reels',
    summary:
      "Promote Nova Apparel's spring collection to fashion-forward audiences with high-energy short-form content.",
    status: 'PENDING_CREATOR',
    source: 'EMAIL',
    estimatedValue: 18000,
    currencyCode: 'USD',
    dueDate: '2025-03-20T00:00:00.000Z',
    createdAt: '2025-09-28T10:15:00.000Z',
    brand: {
      name: 'Nova Apparel',
      domain: 'novaapparel.com',
      contactEmail: 'taylor@nova.example',
      website: 'https://www.novaapparel.com'
    },
    aiSummary:
      'Inbound Nova Apparel campaign for spring launch featuring reels and stories with sustainable messaging.',
    metadata: {
      usageRights: 'Organic',
      paymentStatus: 'Awaiting Payment',
      deliverables: '3 Instagram Reels, 2 Stories',
      campaign: 'Spring Launch Sponsored Reels',
      objective:
        "Promote Nova Apparel's new spring collection to fashion-forward millennials and Gen Z audiences.",
      timeline: 'Content due by March 15, 2025. Posting schedule: March 20-27, 2025',
      brandGuidelines:
        'Use bright, vibrant colors. Emphasize sustainability and comfort. Tag @NovaApparel in all posts',
      talkingPoints: [
        'Sustainable materials and ethical manufacturing',
        'Versatile pieces for work and weekend',
        'Exclusive 20% discount code for followers'
      ],
      hashtags: '#NovaApparel #SpringStyle #SustainableFashion #OOTD',
      deliverablesList: [
        { type: 'Instagram Reels', count: 3, specs: '60-90 seconds each, vertical format (9:16)' },
        { type: 'Instagram Stories', count: 2, specs: '15 seconds each, swipe-up link included' }
      ],
      agentTimeline: [
        {
          timestamp: '2025-09-28 10:15 AM',
          action: 'Deal Created',
          details: 'Inbound inquiry received from Nova Apparel via email',
          rationale: "Brand matches creator's fashion niche and audience demographics"
        },
        {
          timestamp: '2025-09-28 10:20 AM',
          action: 'Initial Review',
          details: 'Agent analyzed brand fit and deal terms',
          rationale: 'Deal amount within acceptable range ($15k-$25k)'
        },
        {
          timestamp: '2025-09-28 11:45 AM',
          action: 'Counter Offer Sent',
          details: 'Proposed $18,000 (up from initial $15,000)',
          rationale: "Creator's engagement rate justifies premium pricing"
        },
        {
          timestamp: '2025-09-29 2:30 PM',
          action: 'Terms Accepted',
          details: 'Brand agreed to $18,000 with organic usage rights',
          rationale: 'Deal meets minimum threshold. Organic rights align with creator preferences'
        }
      ]
    }
  },
  {
    id: 'sample-holiday-package',
    title: 'Holiday Content Package',
    summary:
      "Drive awareness and sales for Acme's new holiday beverage line with festive multi-platform content.",
    status: 'NEGOTIATION',
    source: 'OUTBOUND',
    estimatedValue: 12000,
    currencyCode: 'USD',
    dueDate: '2025-12-01T00:00:00.000Z',
    createdAt: '2025-09-25T09:00:00.000Z',
    brand: {
      name: 'Acme Beverages',
      domain: 'acmebeverages.com',
      contactEmail: 'jamie@acme.example',
      website: 'https://www.acmebeverages.com'
    },
    aiSummary:
      'Outbound holiday beverage campaign with YouTube and TikTok deliverables currently mid-negotiation.',
    metadata: {
      usageRights: 'Whitelisting',
      paymentStatus: 'Paid',
      deliverables: '1 YouTube Video, 5 TikToks',
      campaign: 'Holiday Content Package',
      objective:
        "Drive awareness and sales for Acme's new holiday beverage line during Q4 season.",
      timeline: 'Content due by November 20, 2025. Posting schedule: December 1-15, 2025',
      brandGuidelines:
        'Festive and cozy vibes. Show products in holiday settings. Must include product shots',
      talkingPoints: [
        'Limited edition holiday flavors',
        'Perfect for holiday gatherings',
        'Available at major retailers nationwide'
      ],
      hashtags: '#AcmeBeverages #HolidayDrinks #FestiveFlavors #HolidaySeason',
      deliverablesList: [
        { type: 'YouTube Video', count: 1, specs: '8-12 minutes, include product review and taste test' },
        { type: 'TikTok Videos', count: 5, specs: '30-60 seconds each, trending audio encouraged' }
      ],
      agentTimeline: [
        {
          timestamp: '2025-09-25 9:00 AM',
          action: 'Outreach Initiated',
          details: 'Agent identified Acme Beverages as potential partner',
          rationale: "Brand actively seeking creators in food/lifestyle space"
        },
        {
          timestamp: '2025-09-25 3:15 PM',
          action: 'Initial Response',
          details: 'Brand expressed interest, requested rate card',
          rationale: 'Quick response indicates high interest level'
        },
        {
          timestamp: '2025-09-26 11:00 AM',
          action: 'Proposal Sent',
          details: 'Submitted $12,000 package with whitelisting rights',
          rationale: "Whitelisting adds value for brand's paid ad strategy"
        },
        {
          timestamp: '2025-09-27 4:20 PM',
          action: 'Negotiation in Progress',
          details: 'Brand requested minor timeline adjustment',
          rationale: 'Escalated to creator for approval on revised posting schedule'
        }
      ]
    }
  },
  {
    id: 'sample-winter-campaign',
    title: 'Winter Campaign 2024',
    summary: "Showcase Arctic Gear's winter collection in authentic outdoor settings.",
    status: 'CLOSED_WON',
    source: 'EMAIL',
    estimatedValue: 25000,
    currencyCode: 'USD',
    dueDate: '2024-12-20T00:00:00.000Z',
    createdAt: '2024-11-15T09:00:00.000Z',
    brand: {
      name: 'Arctic Gear Co.',
      domain: 'arcticgear.co',
      contactEmail: 'contact@arcticgear.example',
      website: 'https://www.arcticgear.co'
    },
    aiSummary: 'Completed inbound winter campaign with high engagement and full deliverable approval.',
    metadata: {
      usageRights: 'Organic',
      paymentStatus: 'Paid',
      deliverables: '5 Instagram Posts, 3 Reels',
      campaign: 'Winter Campaign 2024',
      objective: "Showcase Arctic Gear's winter collection in authentic outdoor settings.",
      timeline: 'Completed December 2024',
      brandGuidelines: 'Authentic outdoor lifestyle. Emphasize durability and warmth',
      talkingPoints: ['Extreme weather tested', 'Sustainable materials', 'Lifetime warranty'],
      hashtags: '#ArcticGear #WinterAdventure #OutdoorLife',
      deliverablesList: [
        { type: 'Instagram Posts', count: 5, specs: 'High-quality photos, carousel format preferred' },
        { type: 'Instagram Reels', count: 3, specs: '30-60 seconds, outdoor adventure theme' }
      ],
      agentTimeline: [
        {
          timestamp: '2024-11-15 9:00 AM',
          action: 'Deal Created',
          details: 'Inbound inquiry from Arctic Gear',
          rationale: 'Strong brand alignment with outdoor content niche'
        },
        {
          timestamp: '2024-12-15 3:00 PM',
          action: 'Deal Closed Won',
          details: 'All deliverables completed and approved',
          rationale: 'Successful campaign with high engagement rates'
        }
      ]
    }
  },
  {
    id: 'sample-tech-review',
    title: 'Tech Review Series',
    summary: "Review GadgetPro's new product line for tech-savvy audiences.",
    status: 'CLOSED_LOST',
    source: 'OUTBOUND',
    estimatedValue: 8000,
    currencyCode: 'USD',
    dueDate: '2025-08-25T00:00:00.000Z',
    createdAt: '2025-08-01T10:00:00.000Z',
    brand: {
      name: 'GadgetPro',
      domain: 'gadgetpro.com',
      contactEmail: 'partnerships@gadgetpro.example',
      website: 'https://www.gadgetpro.com'
    },
    aiSummary: 'Outbound tech review proposal lost to competitor due to budget and timeline conflicts.',
    metadata: {
      usageRights: 'Whitelisting',
      paymentStatus: 'Overdue',
      deliverables: '2 YouTube Videos',
      campaign: 'Tech Review Series',
      objective: "Review GadgetPro's new product line for tech-savvy audience.",
      timeline: 'Proposed for August 2025',
      brandGuidelines: 'Professional and informative tone. Focus on features and benefits',
      talkingPoints: ['Innovative technology', 'User-friendly design', 'Competitive pricing'],
      hashtags: '#GadgetPro #TechReview #Innovation',
      deliverablesList: [
        { type: 'YouTube Videos', count: 2, specs: '10-15 minutes each, detailed product reviews' }
      ],
      agentTimeline: [
        {
          timestamp: '2025-08-01 10:00 AM',
          action: 'Outreach Initiated',
          details: 'Pitched tech review collaboration to GadgetPro',
          rationale: 'Brand fit with tech content vertical'
        },
        {
          timestamp: '2025-08-20 2:00 PM',
          action: 'Deal Closed Lost',
          details: 'Brand decided to go with different creator',
          rationale: 'Budget constraints and timeline conflicts'
        }
      ]
    }
  }
];

async function main() {
  const email = process.env.SEED_CREATOR_EMAIL ?? 'creator@example.com';
  const displayName = process.env.SEED_CREATOR_NAME ?? 'Demo Creator';
  const phoneNumber = process.env.SEED_CREATOR_PHONE ?? '+15555550100';

  const creator = await prisma.creator.upsert({
    where: { email },
    update: {
      displayName,
      phoneNumber
    },
    create: {
      displayName,
      email,
      phoneNumber,
      status: 'ACTIVE'
    }
  });

  for (const deal of SAMPLE_DEALS) {
    const brand = await prisma.brand.upsert({
      where: {
        name_domain: {
          name: deal.brand.name,
          domain: deal.brand.domain
        }
      },
      update: {
        contactEmail: deal.brand.contactEmail,
        website: deal.brand.website ?? null
      },
      create: {
        name: deal.brand.name,
        domain: deal.brand.domain,
        contactEmail: deal.brand.contactEmail,
        website: deal.brand.website ?? null
      }
    });

    const payload = {
      title: deal.title,
      summary: deal.summary,
      status: deal.status,
      source: deal.source,
      estimatedValue: deal.estimatedValue,
      currencyCode: deal.currencyCode,
      dueDate: new Date(deal.dueDate),
      aiSummary: deal.aiSummary,
      metadata: JSON.stringify({
        brandName: deal.brand.name,
        estimatedValue: deal.estimatedValue,
        ...deal.metadata
      }),
      creatorId: creator.id,
      brandId: brand.id,
      createdAt: new Date(deal.createdAt)
    };

    await prisma.deal.upsert({
      where: { id: deal.id },
      update: payload,
      create: {
        id: deal.id,
        ...payload
      }
    });
  }

  console.log(
    JSON.stringify(
      {
        message: 'Seeded creator',
        creatorId: creator.id,
        email: creator.email,
        phoneNumber: creator.phoneNumber
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
