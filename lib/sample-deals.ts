export interface SampleDeal {
  deal: string
  company: string
  email: string
  amount: string
  deliverables: string
  stage: string
  closeDate: string
  goLiveDate: string
  source: "Inbound" | "Outbound"
  outreachBrandId: number | null
  outreachBrandName?: string
  usageRights: string
  paymentStatus: string
  creativeBrief: {
    campaign: string
    objective: string
    deliverables: {
      type: string
      count: number
      specs: string
    }[]
    timeline: string
    brandGuidelines: string
    talking_points: string[]
    hashtags: string
  }
  agentTimeline: {
    timestamp: string
    action: string
    details: string
    rationale: string
  }[]
}

export const sampleDeals: SampleDeal[] = [
  {
    deal: "New Brand Deal - Nike",
    company: "Nike",
    email: "partnerships@nike.example",
    amount: "$15,000",
    deliverables: "2 Instagram Reels, 1 TikTok",
    stage: "New",
    closeDate: "10/14/2025",
    goLiveDate: "11/05/2025",
    source: "Inbound",
    outreachBrandId: null,
    usageRights: "Organic",
    paymentStatus: "Awaiting Payment",
    creativeBrief: {
      campaign: "New Brand Deal - Nike",
      objective: "Launch Nike's fall training collection with high-energy social content that highlights comfort and performance.",
      deliverables: [
        { type: "Instagram Reels", count: 2, specs: "45-60 seconds, 9:16 vertical, include product shout-out and CTA" },
        { type: "TikTok Video", count: 1, specs: "30 seconds, 9:16 vertical, highlight key product features" }
      ],
      timeline: "First draft due by October 28, 2025. Final posts scheduled for November 5-12, 2025.",
      brandGuidelines: "Maintain Nike's bold, energetic tone. Showcase athletic movement. Use brand colors where possible.",
      talking_points: [
        "Highlight the breathable fabric technology",
        "Call out limited fall colorways",
        "Encourage followers to train with confidence"
      ],
      hashtags: "#NikePartner #FallTraining #JustDoIt"
    },
    agentTimeline: [
      {
        timestamp: "2025-10-10 8:05 PM",
        action: "Deal Created",
        details: "Inbound inquiry detected from Nike partnerships team.",
        rationale: "High-value brand match for creator's athletic niche."
      },
      {
        timestamp: "2025-10-10 8:10 PM",
        action: "Initial Review",
        details: "AI classified message as deal opportunity and drafted summary.",
        rationale: "Email references brand partnership terms and deliverables."
      },
      {
        timestamp: "2025-10-10 8:25 PM",
        action: "Awaiting Creator Review",
        details: "SMS notification prepared (pending Twilio configuration).",
        rationale: "Creator confirmation needed before negotiating contract."
      }
    ]
  },
  {
    deal: "Spring Launch Sponsored Reels",
    company: "Nova Apparel",
    email: "taylor@nova.example",
    amount: "$18,000",
    deliverables: "3 Instagram Reels, 2 Stories",
    stage: "New",
    closeDate: "10/28/2025",
    goLiveDate: "11/15/2025",
    source: "Inbound",
    outreachBrandId: null,
    usageRights: "Organic",
    paymentStatus: "Awaiting Payment",
    creativeBrief: {
      campaign: "Spring Launch Sponsored Reels",
      objective: "Promote Nova Apparel's new spring collection to fashion-forward millennials and Gen Z audiences",
      deliverables: [
        { type: "Instagram Reels", count: 3, specs: "60-90 seconds each, vertical format (9:16)" },
        { type: "Instagram Stories", count: 2, specs: "15 seconds each, swipe-up link included" },
      ],
      timeline: "Content due by March 15, 2025. Posting schedule: March 20-27, 2025",
      brandGuidelines:
        "Use bright, vibrant colors. Emphasize sustainability and comfort. Tag @NovaApparel in all posts",
      talking_points: [
        "Sustainable materials and ethical manufacturing",
        "Versatile pieces for work and weekend",
        "Exclusive 20% discount code for followers",
      ],
      hashtags: "#NovaApparel #SpringStyle #SustainableFashion #OOTD",
    },
    agentTimeline: [
      {
        timestamp: "2025-09-28 10:15 AM",
        action: "Deal Created",
        details: "Inbound inquiry received from Nova Apparel via email",
        rationale: "Brand matches creator's fashion niche and audience demographics",
      },
      {
        timestamp: "2025-09-28 10:20 AM",
        action: "Initial Review",
        details: "Agent analyzed brand fit and deal terms",
        rationale: "Deal amount within acceptable range ($15k-$25k). Brand reputation verified (4.5/5 rating)",
      },
      {
        timestamp: "2025-09-28 11:45 AM",
        action: "Counter Offer Sent",
        details: "Proposed $18,000 (up from initial $15,000)",
        rationale: "Creator's engagement rate (8.2%) and audience size (250k) justify premium pricing",
      },
      {
        timestamp: "2025-09-29 2:30 PM",
        action: "Terms Accepted",
        details: "Brand agreed to $18,000 with organic usage rights",
        rationale: "Deal meets minimum threshold. Organic rights align with creator preferences",
      },
    ],
  },
  {
    deal: "Holiday Content Package",
    company: "Acme Beverages",
    email: "jamie@acme.example",
    amount: "$12,000",
    deliverables: "1 YouTube Video, 5 TikToks",
    stage: "Negotiation",
    closeDate: "10/8/2025",
    goLiveDate: "12/1/2025",
    source: "Outbound",
    outreachBrandId: 1,
    outreachBrandName: "TechFlow Inc",
    usageRights: "Whitelisting",
    paymentStatus: "Paid",
    creativeBrief: {
      campaign: "Holiday Content Package",
      objective: "Drive awareness and sales for Acme's new holiday beverage line during Q4 season",
      deliverables: [
        {
          type: "YouTube Video",
          count: 1,
          specs: "8-12 minutes, landscape format, include product review and taste test",
        },
        { type: "TikTok Videos", count: 5, specs: "30-60 seconds each, trending audio encouraged" },
      ],
      timeline: "Content due by November 20, 2025. Posting schedule: December 1-15, 2025",
      brandGuidelines: "Festive and cozy vibes. Show products in holiday settings. Must include product shots",
      talking_points: [
        "Limited edition holiday flavors",
        "Perfect for holiday gatherings",
        "Available at major retailers nationwide",
      ],
      hashtags: "#AcmeBeverages #HolidayDrinks #FestiveFlavors #HolidaySeason",
    },
    agentTimeline: [
      {
        timestamp: "2025-09-25 9:00 AM",
        action: "Outreach Initiated",
        details: "Agent identified Acme Beverages as potential partner",
        rationale: "Brand actively seeking creators in food/lifestyle space. Budget range matches creator tier",
      },
      {
        timestamp: "2025-09-25 3:15 PM",
        action: "Initial Response",
        details: "Brand expressed interest, requested rate card",
        rationale: "Quick response indicates high interest level",
      },
      {
        timestamp: "2025-09-26 11:00 AM",
        action: "Proposal Sent",
        details: "Submitted $12,000 package with whitelisting rights",
        rationale:
          "Whitelisting adds value for brand's paid ad strategy. Premium justified by creator's conversion metrics",
      },
      {
        timestamp: "2025-09-27 4:20 PM",
        action: "Negotiation in Progress",
        details: "Brand requested minor timeline adjustment",
        rationale: "Escalated to creator for approval on revised posting schedule",
      },
    ],
  },
  {
    deal: "Summer Videos",
    company: "Nova Apparel",
    email: "—",
    amount: "$12,000",
    deliverables: "4 YouTube Shorts",
    stage: "New",
    closeDate: "10/28/2025",
    goLiveDate: "6/10/2025",
    source: "Outbound",
    outreachBrandId: 2,
    outreachBrandName: "Urban Lifestyle Co",
    usageRights: "Paid Usage",
    paymentStatus: "Overdue",
    creativeBrief: {
      campaign: "Summer Videos",
      objective: "Showcase Nova Apparel's summer collection with quick, engaging video content",
      deliverables: [
        { type: "YouTube Shorts", count: 4, specs: "60 seconds max, vertical format (9:16), high energy editing" },
      ],
      timeline: "Content due by June 1, 2025. Posting schedule: June 10-24, 2025",
      brandGuidelines: "Beach and outdoor settings preferred. Bright, sunny aesthetics. Show clothing in action",
      talking_points: [
        "Lightweight and breathable fabrics",
        "Perfect for summer adventures",
        "Mix and match versatility",
      ],
      hashtags: "#NovaApparel #SummerStyle #BeachVibes #SummerFashion",
    },
    agentTimeline: [
      {
        timestamp: "2025-09-20 2:00 PM",
        action: "Deal Created",
        details: "Outbound pitch to Nova Apparel for summer campaign",
        rationale: "Existing relationship from previous successful collaboration. Seasonal timing optimal",
      },
      {
        timestamp: "2025-09-21 10:30 AM",
        action: "Terms Proposed",
        details: "Submitted $12,000 for 4 YouTube Shorts with paid usage rights",
        rationale: "Paid usage rights increase deal value. Brand has budget for amplification",
      },
      {
        timestamp: "2025-09-23 1:15 PM",
        action: "Awaiting Response",
        details: "Follow-up sent to brand contact",
        rationale: "No response after 48 hours. Automated follow-up triggered",
      },
    ],
  },
  {
    deal: "Winter Campaign 2024",
    company: "Arctic Gear Co.",
    email: "contact@arcticgear.example",
    amount: "$25,000",
    deliverables: "5 Instagram Posts, 3 Reels",
    stage: "Closed Won",
    closeDate: "12/15/2024",
    goLiveDate: "12/20/2024",
    source: "Inbound",
    outreachBrandId: null,
    usageRights: "Organic",
    paymentStatus: "Paid",
    creativeBrief: {
      campaign: "Winter Campaign 2024",
      objective: "Showcase Arctic Gear's winter collection in authentic outdoor settings",
      deliverables: [
        { type: "Instagram Posts", count: 5, specs: "High-quality photos, carousel format preferred" },
        { type: "Instagram Reels", count: 3, specs: "30-60 seconds, outdoor adventure theme" },
      ],
      timeline: "Completed December 2024",
      brandGuidelines: "Authentic outdoor lifestyle. Emphasize durability and warmth",
      talking_points: ["Extreme weather tested", "Sustainable materials", "Lifetime warranty"],
      hashtags: "#ArcticGear #WinterAdventure #OutdoorLife",
    },
    agentTimeline: [
      {
        timestamp: "2024-11-15 9:00 AM",
        action: "Deal Created",
        details: "Inbound inquiry from Arctic Gear",
        rationale: "Strong brand alignment with outdoor content niche",
      },
      {
        timestamp: "2024-12-15 3:00 PM",
        action: "Deal Closed Won",
        details: "All deliverables completed and approved",
        rationale: "Successful campaign with high engagement rates",
      },
    ],
  },
  {
    deal: "Tech Review Series",
    company: "GadgetPro",
    email: "partnerships@gadgetpro.example",
    amount: "$8,000",
    deliverables: "2 YouTube Videos",
    stage: "Closed Lost",
    closeDate: "08/20/2025",
    goLiveDate: "8/25/2025",
    source: "Outbound",
    outreachBrandId: null,
    usageRights: "Whitelisting",
    paymentStatus: "Overdue",
    creativeBrief: {
      campaign: "Tech Review Series",
      objective: "Review GadgetPro's new product line for tech-savvy audience",
      deliverables: [{ type: "YouTube Videos", count: 2, specs: "10-15 minutes each, detailed product reviews" }],
      timeline: "Proposed for August 2025",
      brandGuidelines: "Professional and informative tone. Focus on features and benefits",
      talking_points: ["Innovative technology", "User-friendly design", "Competitive pricing"],
      hashtags: "#GadgetPro #TechReview #Innovation",
    },
    agentTimeline: [
      {
        timestamp: "2025-08-01 10:00 AM",
        action: "Outreach Initiated",
        details: "Pitched tech review collaboration to GadgetPro",
        rationale: "Brand fit with tech content vertical",
      },
      {
        timestamp: "2025-08-20 2:00 PM",
        action: "Deal Closed Lost",
        details: "Brand decided to go with different creator",
        rationale: "Budget constraints and timeline conflicts",
      },
    ],
  },
]
