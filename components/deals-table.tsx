"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Building2Icon, DollarSignIcon, CalendarIcon } from "@/components/icons"
import type { NegotiationPlan, NegotiationStatus } from "@/hooks/use-negotiation-state"

export type DealStage = "New" | "Negotiation" | "Closed Won" | "Closed Lost"

type ApiDeal = {
  id: string
  title: string | null
  summary: string | null
  status: string
  source: string
  estimatedValue: number | null
  currencyCode: string | null
  dueDate: string | null
  aiSummary: string | null
  metadata: string | null
  createdAt: string
  updatedAt: string
  inboundEmail?: {
    subject: string | null
    fromAddress: string
    toAddress: string | null
    receivedAt: string
  } | null
  brand?: {
    name: string | null
    contactEmail: string | null
  } | null
}

type UiDeal = {
  id: string
  deal: string
  company: string
  email: string
  amount: string
  deliverables: string
  stage: DealStage
  closeDate: string
  goLiveDate: string
  source: "Inbound" | "Outbound"
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

const negotiationStatusBadgeMap: Partial<Record<NegotiationStatus, { label: string; className: string }>> = {
  "recommendation-ready": {
    label: "Counter ready",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "in-progress": {
    label: "AI negotiating",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  completed: {
    label: "Negotiated",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
}

const sampleDeals: UiDeal[] = [
  {
    id: "sample-nike",
    deal: "New Brand Deal - Nike",
    company: "Nike",
    email: "partnerships@nike.example",
    amount: "$15,000",
    deliverables: "2 Instagram Reels, 1 TikTok",
    stage: "New",
    closeDate: "Oct 28, 2025",
    goLiveDate: "Nov 15, 2025",
    source: "Inbound",
    usageRights: "Organic",
    paymentStatus: "Awaiting Payment",
    creativeBrief: {
      campaign: "New Brand Deal - Nike",
      objective:
        "Launch Nike's fall training collection with high-energy social content highlighting comfort and performance",
      deliverables: [
        { type: "Instagram Reels", count: 2, specs: "45-60 seconds, vertical (9:16), include CTA" },
        { type: "TikTok Video", count: 1, specs: "30 seconds, highlight key product features" },
      ],
      timeline: "Content due by Nov 5, 2025. Posting window Nov 10-20, 2025",
      brandGuidelines: "Energetic tone, showcase movement, use Nike brand colors and #JustDoIt",
      talking_points: [
        "New fall training collection",
        "Breathable fabric technology",
        "Limited seasonal colorways",
      ],
      hashtags: "#NikePartner #FallTraining #JustDoIt",
    },
    agentTimeline: [
      {
        timestamp: "2025-10-10 8:05 PM",
        action: "Deal Created",
        details: "Inbound inquiry detected from Nike partnerships team",
        rationale: "High-value brand aligned with creator's athletic niche",
      },
      {
        timestamp: "2025-10-10 8:10 PM",
        action: "Initial Review",
        details: "AI classified message as deal opportunity and drafted summary",
        rationale: "Email references partnership terms and deliverables",
      },
    ],
  },
  {
    id: "sample-nova-reels",
    deal: "Spring Launch Sponsored Reels",
    company: "Nova Apparel",
    email: "taylor@nova.example",
    amount: "$18,000",
    deliverables: "3 Instagram Reels, 2 Stories",
    stage: "New",
    closeDate: "Oct 28, 2025",
    goLiveDate: "Nov 15, 2025",
    source: "Inbound",
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
        rationale: "Deal amount within acceptable range ($15k-$25k). Brand reputation verified",
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
    id: "sample-holiday-package",
    deal: "Holiday Content Package",
    company: "Acme Beverages",
    email: "jamie@acme.example",
    amount: "$12,000",
    deliverables: "1 YouTube Video, 5 TikToks",
    stage: "Negotiation",
    closeDate: "Oct 8, 2025",
    goLiveDate: "Dec 1, 2025",
    source: "Outbound",
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
    id: "sample-summer-videos",
    deal: "Summer Videos",
    company: "Nova Apparel",
    email: "—",
    amount: "$12,000",
    deliverables: "4 YouTube Shorts",
    stage: "New",
    closeDate: "Oct 28, 2025",
    goLiveDate: "Jun 10, 2025",
    source: "Outbound",
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
    id: "sample-winter-campaign",
    deal: "Winter Campaign 2024",
    company: "Arctic Gear Co.",
    email: "contact@arcticgear.example",
    amount: "$25,000",
    deliverables: "5 Instagram Posts, 3 Reels",
    stage: "Closed Won",
    closeDate: "Dec 15, 2024",
    goLiveDate: "Dec 20, 2024",
    source: "Inbound",
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
    id: "sample-tech-review",
    deal: "Tech Review Series",
    company: "GadgetPro",
    email: "partnerships@gadgetpro.example",
    amount: "$8,000",
    deliverables: "2 YouTube Videos",
    stage: "Closed Lost",
    closeDate: "Aug 20, 2025",
    goLiveDate: "Aug 25, 2025",
    source: "Outbound",
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

function getPaymentStatusBadge(status: string) {
  switch (status) {
    case "Awaiting Payment":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Awaiting Payment
        </Badge>
      )
    case "Paid":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Paid
        </Badge>
      )
    case "Overdue":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Overdue
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getSourceBadge(source: string) {
  if (source === "Outbound") {
    return (
      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        Outbound
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
      Inbound
    </Badge>
  )
}

type DealFilter = "all" | "active" | "closed-won" | "closed-lost"

interface DealsTableProps {
  filter: DealFilter
}

export function DealsTable({ filter }: DealsTableProps) {
  const router = useRouter()
  const [apiDeals, setApiDeals] = useState<UiDeal[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [negotiationPlans, setNegotiationPlans] = useState<Record<string, NegotiationPlan>>({})

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadDeals = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/deals?limit=50", {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load deals (${response.status})`)
        }

        const payload = (await response.json()) as { data?: ApiDeal[] }
        const apiList = Array.isArray(payload.data) ? payload.data : []
        const mapped = apiList.map(mapApiDealToUiDeal)
        if (isMounted && mapped.length > 0) {
          setApiDeals(mapped)
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to load deals", err)
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to load deals")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDeals()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    const loadPlans = () => {
      if (typeof window === "undefined") return
      try {
        const raw = window.localStorage.getItem("griphyn-negotiation-plans")
        if (raw) {
          const parsed = JSON.parse(raw) as Record<string, NegotiationPlan>
          setNegotiationPlans(parsed)
        }
      } catch (err) {
        console.warn("Failed to load negotiation map", err)
      }
    }

    loadPlans()
    const handler = () => loadPlans()
    window.addEventListener("griphyn-negotiation-plan-updated", handler)
    return () => {
      window.removeEventListener("griphyn-negotiation-plan-updated", handler)
    }
  }, [])

  const deals = useMemo(() => (apiDeals && apiDeals.length > 0 ? apiDeals : sampleDeals), [apiDeals])

  const filteredDeals = deals.filter((deal) => {
    if (filter === "all") return true
    if (filter === "active") return deal.stage === "New" || deal.stage === "Negotiation"
    if (filter === "closed-won") return deal.stage === "Closed Won"
    if (filter === "closed-lost") return deal.stage === "Closed Lost"
    return true
  })

  const getFilterLabel = () => {
    switch (filter) {
      case "all":
        return `All Deals (${filteredDeals.length})`
      case "active":
        return `Active Deals (${filteredDeals.length})`
      case "closed-won":
        return `Closed Won (${filteredDeals.length})`
      case "closed-lost":
        return `Closed Lost (${filteredDeals.length})`
    }
  }

  const getStageValue = (stage: DealStage) => stage.toLowerCase().replace(/\s+/g, "-")

  if (isLoading && (!apiDeals || apiDeals.length === 0)) {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <div className="p-4 md:p-6 text-sm text-muted-foreground">Loading deals…</div>
      </Card>
    )
  }

  if (error && (!apiDeals || apiDeals.length === 0)) {
    return (
      <Card className="border border-border bg-card shadow-sm">
        <div className="p-4 md:p-6 space-y-3">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground">Showing sample deals while the API is unavailable.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border border-border bg-card shadow-sm">
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">{getFilterLabel()}</h2>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deal</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Company</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stage</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Close Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usage Rights</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Go Live Date</th>
                {!(filter === "closed-lost") && (
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Payment Status</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal, index) => {
                const plan = deal.id ? negotiationPlans[deal.id] : undefined
                const negotiationMeta =
                  plan && plan.status !== "idle" ? negotiationStatusBadgeMap[plan.status] : undefined

                return (
                  <tr
                    key={deal.id ?? index}
                    onClick={() => router.push(`/deals/${deal.id ?? index}`)}
                    className="border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{deal.deal}</span>
                        {negotiationMeta && (
                          <Badge variant="outline" className={`w-fit text-[11px] ${negotiationMeta.className}`}>
                            {negotiationMeta.label}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">{deal.company}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{deal.amount}</td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <Select defaultValue={getStageValue(deal.stage)}>
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed-won">Closed Won</SelectItem>
                          <SelectItem value="closed-lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">{deal.closeDate}</td>
                    <td className="py-4 px-4 text-sm">{getSourceBadge(deal.source)}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{deal.usageRights}</td>
                    <td className="py-4 px-4 text-sm text-foreground">{deal.goLiveDate}</td>
                    {deal.stage !== "Closed Lost" && (
                      <td className="py-4 px-4 text-sm">{getPaymentStatusBadge(deal.paymentStatus)}</td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {filteredDeals.map((deal, index) => {
            const plan = deal.id ? negotiationPlans[deal.id] : undefined
            const negotiationMeta =
              plan && plan.status !== "idle" ? negotiationStatusBadgeMap[plan.status] : undefined

            return (
              <div
                key={deal.id ?? index}
                onClick={() => router.push(`/deals/${deal.id ?? index}`)}
                className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground text-base">{deal.deal}</h3>
                      {negotiationMeta && (
                        <Badge variant="outline" className={`mt-1 text-[11px] ${negotiationMeta.className}`}>
                          {negotiationMeta.label}
                        </Badge>
                      )}
                    </div>
                    {getSourceBadge(deal.source)}
                  </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2Icon className="h-4 w-4" />
                  <span>{deal.company}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{deal.amount}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{deal.closeDate}</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select defaultValue={getStageValue(deal.stage)}>
                      <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed-won">Closed Won</SelectItem>
                        <SelectItem value="closed-lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-sm text-muted-foreground">Go Live Date: {deal.goLiveDate}</span>
                  {deal.stage !== "Closed Lost" && getPaymentStatusBadge(deal.paymentStatus)}
                </div>

                  <div className="text-xs text-muted-foreground pt-1">
                    <span className="font-medium">Usage Rights:</span> {deal.usageRights}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export { sampleDeals as deals }

function mapApiDealToUiDeal(deal: ApiDeal): UiDeal {
  const metadata = parseMetadata(deal.metadata)
  const estimatedValue =
    typeof deal.estimatedValue === "number"
      ? deal.estimatedValue
      : typeof metadata.estimatedValue === "number"
        ? metadata.estimatedValue
        : null

  const amount = formatCurrency(estimatedValue, deal.currencyCode ?? "USD")
  const stage = mapStatusToStage(deal.status)
  const company =
    metadata.brandName ??
    deal.brand?.name ??
    deal.inboundEmail?.fromAddress ??
    "Unknown brand"

  const usageRights = metadata.usageRights ?? "Review required"
  const paymentStatus =
    metadata.paymentStatus ??
    (stage === "Closed Won" ? "Paid" : stage === "Closed Lost" ? "N/A" : "Awaiting Payment")

  return {
    id: deal.id,
    deal: deal.title ?? deal.inboundEmail?.subject ?? "New brand opportunity",
    company,
    email: deal.brand?.contactEmail ?? deal.inboundEmail?.fromAddress ?? "unknown",
    amount,
    deliverables: metadata.deliverables ?? "Pending intake",
    stage,
    closeDate: formatDate(deal.updatedAt),
    goLiveDate: formatDate(deal.dueDate ?? deal.createdAt),
    source: deal.source === "EMAIL" ? "Inbound" : "Outbound",
    usageRights,
    paymentStatus,
    creativeBrief: {
      campaign: metadata.campaign ?? (deal.title ?? "Campaign"),
      objective: metadata.objective ?? (deal.summary ?? "Objective pending"),
      deliverables: Array.isArray(metadata.deliverablesList) ? metadata.deliverablesList : [],
      timeline: metadata.timeline ?? "Timeline to be determined",
      brandGuidelines: metadata.brandGuidelines ?? "Guidelines pending",
      talking_points: Array.isArray(metadata.talkingPoints) ? metadata.talkingPoints : [],
      hashtags: metadata.hashtags ?? "#campaign",
    },
    agentTimeline: Array.isArray(metadata.agentTimeline)
      ? metadata.agentTimeline
      : [
          {
            timestamp: formatDateTime(deal.createdAt),
            action: "Deal Created",
            details: "Email ingested and awaiting creator confirmation",
            rationale: "Detected via Gmail polling",
          },
        ],
  }
}

function mapStatusToStage(status: string): DealStage {
  switch (status.toUpperCase()) {
    case "ACTIVE":
    case "PENDING_CREATOR":
      return "New"
    case "NEGOTIATION":
    case "PENDING_BRAND":
      return "Negotiation"
    case "COMPLETED":
    case "CLOSED_WON":
    case "WON":
      return "Closed Won"
    case "UNQUALIFIED":
    case "CANCELLED":
    case "CLOSED_LOST":
    case "LOST":
    case "REJECTED":
      return "Closed Lost"
    default:
      return "New"
  }
}

function parseMetadata(raw: string | null | undefined): Record<string, any> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, any>
  } catch (err) {
    console.warn("Failed to parse deal metadata", err)
    return {}
  }
}

function formatCurrency(amount: number | null, currency: string) {
  if (amount == null || Number.isNaN(amount)) return "—"
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `$${amount.toFixed(0)}`
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleString()
}
