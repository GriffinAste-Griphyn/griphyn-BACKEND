"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building2, DollarSign, Calendar, FileText, Upload, X, Sparkles, CheckCircle2, Clock3, RotateCcw, Shield, Loader2 } from "lucide-react"
import { deals as sampleDeals, DealStage } from "@/components/deals-table"
import {
  useAgentSettings,
  type NegotiationGuardrails,
  type RateCardEntry,
} from "@/components/agent-settings-provider"
import { DELIVERABLE_PRESETS } from "@/lib/deliverables"
import { useNegotiationState, type NegotiationStatus } from "@/hooks/use-negotiation-state"

interface DealDetailPageProps {
  params: { id: string }
}

type ApiDealResponse = {
  data?: {
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
      parsedData: string | null
    } | null
    brand?: {
      name: string | null
      contactEmail: string | null
    } | null
    creator?: {
      displayName: string
      email: string
    } | null
  }
}

interface DetailedDeal {
  id: string
  deal: string
  company: string
  email: string
  amount: string
  stage: DealStage
  closeDate: string
  goLiveDate: string
  source: string
  usageRights: string
  paymentStatus: string
  summary: string
  aiSummary: string | null
  aiConfidence: number | null
  inboundEmailBody?: string | null
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

type Document = {
  id: string
  name: string
  size: number
  uploadedAt: Date
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [apiDeal, setApiDeal] = useState<DetailedDeal | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)
  const { settings: agentSettings } = useAgentSettings()

  const dealId = params.id
  const fallbackDeal = useMemo(() => {
    const numeric = Number.parseInt(dealId, 10)
    if (!Number.isNaN(numeric)) {
      return sampleDeals[numeric]
    }
    return sampleDeals.find((deal) => deal.id === dealId)
  }, [dealId])

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    const loadDeal = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/deals/${dealId}`, {
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to load deal (${response.status})`)
        }

        const payload = (await response.json()) as ApiDealResponse
        if (!payload.data) {
          throw new Error("Deal not found")
        }

        if (isMounted) {
          setApiDeal(mapApiDealToDetail(payload.data))
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to load deal", err)
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to load deal")
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadDeal()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [dealId])

  const deal = apiDeal ?? (fallbackDeal ? mapSampleDealToDetail(fallbackDeal, dealId) : null)
  const guardrails = agentSettings.negotiation
  const negotiationStatusCopy: Record<
    NegotiationStatus,
    { label: string; help: string; badgeClass: string }
  > = useMemo(
    () => ({
      idle: {
        label: "Not started",
        help: "Generate a counter offer using your guardrails.",
        badgeClass: "bg-muted text-muted-foreground border-border/60",
      },
      "recommendation-ready": {
        label: "Awaiting approval",
        help: "Review the recommended counter and approve to let the agent negotiate.",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      },
      "in-progress": {
        label: "Counter sent",
        help: "AI agent is awaiting a response from the brand. You’ll be notified if they reply.",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      },
      completed: {
        label: "Negotiation closed",
        help: "Mark the deal as won or adjust details to reflect the final agreement.",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
    }),
    [],
  )
  const fallbackAmount = useMemo(() => (fallbackDeal ? parseCurrencyValue(fallbackDeal.amount) : 0), [fallbackDeal])
  const deliverableSummary = useMemo(
    () => summarizeDeliverables(
      deal?.creativeBrief.deliverables ?? fallbackDeal?.creativeBrief.deliverables ?? [],
      agentSettings.rateCard,
    ),
    [deal?.creativeBrief.deliverables, fallbackDeal?.creativeBrief.deliverables, agentSettings.rateCard],
  )
  const initialPlanBuilder = useCallback(() => {
    const rec = calculateRecommendation(fallbackAmount, guardrails, deliverableSummary.total)
    return {
      status: "idle" as const,
      ...rec,
      emailDraft: buildCounterEmail(
        deal ?? null,
        rec.recommendedCounter,
        deliverableSummary.breakdown,
        guardrails,
      ),
      lastUpdated: new Date().toISOString(),
    }
  }, [deliverableSummary.total, fallbackAmount, guardrails])
  const [negotiationPlan, setNegotiationPlan] = useNegotiationState(dealId, initialPlanBuilder)
  const hasAutoGeneratedPlan = useRef(false)

  useEffect(() => {
    hasAutoGeneratedPlan.current = false
  }, [dealId])

  const [paymentStatus, setPaymentStatus] = useState(deal?.paymentStatus || "Awaiting Payment")

  useEffect(() => {
    if (deal) {
      setPaymentStatus(deal.paymentStatus)
    }
  }, [deal?.paymentStatus])

  useEffect(() => {
    const baseAmount = deal ? parseCurrencyValue(deal.amount) : fallbackAmount
    if (!baseAmount) return
    const recommendation = calculateRecommendation(baseAmount, guardrails, deliverableSummary.total)
    setNegotiationPlan((prev) => {
      if (prev.status !== "idle") {
        return prev
      }
      const rationaleChanged = JSON.stringify(prev.rationale) !== JSON.stringify(recommendation.rationale)
      if (
        prev.recommendedCounter === recommendation.recommendedCounter &&
        prev.percentageIncrease === recommendation.percentageIncrease &&
        !rationaleChanged
      ) {
        return prev
      }
      return {
        ...prev,
        ...recommendation,
        emailDraft: buildCounterEmail(
          deal ?? null,
          recommendation.recommendedCounter,
          deliverableSummary.breakdown,
          guardrails,
        ),
        lastUpdated: new Date().toISOString(),
      }
    })
  }, [deal, fallbackAmount, guardrails, setNegotiationPlan, deliverableSummary.total, deliverableSummary.breakdown])

  if (isLoading && !deal) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground">Loading deal...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="p-8 space-y-3">
        <Button variant="ghost" onClick={() => router.push("/deals")} className="flex items-center gap-2 w-fit">
          <ArrowLeft className="h-4 w-4" /> Back to deals
        </Button>
        <p className="text-sm text-muted-foreground">{error ?? "Deal not found"}</p>
      </div>
    )
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const newDocuments = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
    }))
    setDocuments((prev) => [...prev, ...newDocuments])
  }

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

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

  const currentAmountValue = parseCurrencyValue(deal.amount)
  const statusMeta = negotiationStatusCopy[negotiationPlan.status]
  const formattedCounter = formatMoney(negotiationPlan.recommendedCounter || 0)
  const formattedOffer = formatMoney(currentAmountValue || 0)
  const lastUpdatedDisplay = new Date(negotiationPlan.lastUpdated).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })

  const handleGeneratePlan = useCallback(async () => {
    if (!deal) {
      setGenerationError("Deal details are required before generating a plan.")
      return
    }
    setGenerationError(null)
    setIsGeneratingPlan(true)
    try {
      const response = await fetch(`/api/deals/${dealId}/negotiation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal: {
            id: deal.id,
            name: deal.deal,
            company: deal.company,
            amount: parseCurrencyValue(deal.amount),
            summary: deal.summary,
            usageRights: deal.usageRights,
            stage: deal.stage,
            source: deal.source,
            closeDate: deal.closeDate,
            goLiveDate: deal.goLiveDate,
          },
          guardrails,
          currentOffer: currentAmountValue || fallbackAmount || 0,
          deliverableSummary,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(payload?.error ?? "Unable to generate negotiation plan.")
      }

      const payload = (await response.json()) as {
        plan: {
          recommendedCounter: number
          percentageIncrease: number
          rationale: string[]
          emailDraft: string
        }
      }

      setNegotiationPlan((prev) => ({
        ...prev,
        status: "recommendation-ready",
        recommendedCounter: payload.plan.recommendedCounter,
        percentageIncrease: payload.plan.percentageIncrease,
        rationale: payload.plan.rationale,
        emailDraft: payload.plan.emailDraft,
        lastUpdated: new Date().toISOString(),
      }))
    } catch (generationErr) {
      console.error("Failed to generate negotiation plan", generationErr)
      setGenerationError(
        generationErr instanceof Error ? generationErr.message : "Failed to generate negotiation plan.",
      )
    } finally {
      setIsGeneratingPlan(false)
    }
  }, [
    deal,
    dealId,
    deliverableSummary,
    fallbackAmount,
    guardrails,
    currentAmountValue,
    setNegotiationPlan,
  ])

  useEffect(() => {
    if (!deal) return
    if (negotiationPlan.status !== "idle") return
    if (isGeneratingPlan) return
    if (hasAutoGeneratedPlan.current) return

    hasAutoGeneratedPlan.current = true
    void handleGeneratePlan()
  }, [deal, negotiationPlan.status, isGeneratingPlan, handleGeneratePlan])

  const handleApprovePlan = () => {
    setGenerationError(null)
    setNegotiationPlan((prev) => ({
      ...prev,
      status: "in-progress",
      emailDraft: buildCounterEmail(deal, prev.recommendedCounter, deliverableSummary.breakdown, guardrails),
      lastUpdated: new Date().toISOString(),
    }))
  }

  const handleMarkCompleted = () => {
    setGenerationError(null)
    setNegotiationPlan((prev) => ({
      ...prev,
      status: "completed",
      lastUpdated: new Date().toISOString(),
    }))
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.push("/deals")} className="flex items-center gap-2 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to deals
      </Button>

      <Card className="p-6 space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{deal.company}</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">{deal.deal}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>{deal.amount}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Last updated {deal.closeDate}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{deal.stage}</Badge>
            <Badge variant="outline">{deal.source}</Badge>
            <Badge variant="outline">{deal.usageRights}</Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="correspondence">Correspondence</TabsTrigger>
          <TabsTrigger value="creative-brief">Creative Brief</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="negotiation">AI Negotiation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 border border-border">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="text-lg font-semibold text-foreground">{deal.amount}</p>
            </Card>
            <Card className="p-4 border border-border">
              <p className="text-xs text-muted-foreground">Company</p>
              <p className="text-lg font-semibold text-foreground break-words">{deal.company}</p>
            </Card>
            <Card className="p-4 border border-border">
              <p className="text-xs text-muted-foreground">Close Date</p>
              <p className="text-lg font-semibold text-foreground">{deal.closeDate}</p>
            </Card>
            <Card className="p-4 border border-border">
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <div className="mt-2">
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{getPaymentStatusBadge(paymentStatus)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Awaiting Payment">Awaiting Payment</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </div>

          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Deal Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{deal.summary}</p>
          </Card>
        </TabsContent>

        <TabsContent value="correspondence" className="space-y-4">
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Agent Timeline</h2>
            <div className="space-y-4">
              {deal.agentTimeline.map((event, index) => (
                <div key={index} className="border-l-2 border-primary/60 pl-4">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-foreground">{event.action}</p>
                    <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{event.details}</p>
                  <p className="text-xs text-muted-foreground italic mt-1">
                    <span className="font-medium">Rationale:</span> {event.rationale}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {deal.inboundEmailBody && (
            <Card className="p-6 border border-border space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Inbound email</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {deal.inboundEmailBody}
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="creative-brief" className="space-y-4">
          <Card className="p-6 border border-border space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Campaign</h3>
              <p className="text-sm text-muted-foreground">{deal.creativeBrief.campaign}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Objective</h3>
              <p className="text-sm text-muted-foreground">{deal.creativeBrief.objective}</p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Deliverables</h3>
              {deal.creativeBrief.deliverables.map((item, index) => (
                <div key={index} className="p-4 border border-border rounded-md bg-muted/40">
                  <p className="font-medium text-foreground">
                    {item.count}x {item.type}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{item.specs}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Timeline</h3>
              <p className="text-sm text-muted-foreground">{deal.creativeBrief.timeline}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Brand Guidelines</h3>
              <p className="text-sm text-muted-foreground">{deal.creativeBrief.brandGuidelines}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Key Talking Points</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {deal.creativeBrief.talking_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Hashtags</h3>
              <p className="text-sm text-muted-foreground">{deal.creativeBrief.hashtags}</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="p-6 border border-border space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-border bg-muted/20"
              }`}
            >
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop files here</p>
              <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
              <input type="file" id="file-upload" multiple onChange={handleFileInput} className="hidden" />
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                Upload Document
              </Button>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Uploaded Documents ({documents.length})</h3>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-border rounded-md bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-4">
          <Card className="p-6 border border-border space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={statusMeta.badgeClass}>
                    {statusMeta.label}
                  </Badge>
                  <Badge variant="outline" className="border-dashed text-xs uppercase tracking-wide text-muted-foreground">
                    {negotiationPlan.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Counter strategy</h3>
                <p className="text-sm text-muted-foreground max-w-lg">{statusMeta.help}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                <span>Updated {lastUpdatedDisplay}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5 text-foreground" />
                  Current offer
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">{formattedOffer}</p>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Recommended counter
                </p>
                <p className="mt-2 text-lg font-semibold text-primary">{formattedCounter}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Uplift
                </p>
                <p className="mt-2 text-lg font-semibold text-foreground">{negotiationPlan.percentageIncrease}%</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {negotiationPlan.status === "idle" && (
                  <Button
                    onClick={() => void handleGeneratePlan()}
                    className="flex items-center gap-2"
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGeneratingPlan ? "Generating..." : "Generate recommendation"}
                  </Button>
                )}
                {negotiationPlan.status === "recommendation-ready" && (
                  <Button
                    onClick={handleApprovePlan}
                    className="flex items-center gap-2"
                    disabled={isGeneratingPlan}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve &amp; send counter
                  </Button>
                )}
                {negotiationPlan.status === "in-progress" && (
                  <Button
                    variant="secondary"
                    onClick={handleMarkCompleted}
                    className="flex items-center gap-2"
                    disabled={isGeneratingPlan}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark negotiation complete
                  </Button>
                )}
                {negotiationPlan.status !== "idle" && negotiationPlan.status !== "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      hasAutoGeneratedPlan.current = true
                      void handleGeneratePlan()
                    }}
                    className="flex items-center gap-2"
                    disabled={isGeneratingPlan}
                  >
                    {isGeneratingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isGeneratingPlan ? "Regenerating..." : "Regenerate recommendation"}
                  </Button>
                )}
                {negotiationPlan.status === "completed" && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Negotiation complete
                </Badge>
                )}
                <Button
                  variant="ghost"
                  onClick={() => {
                    setGenerationError(null)
                    hasAutoGeneratedPlan.current = false
                    setNegotiationPlan(initialPlanBuilder())
                  }}
                  className="flex items-center gap-2 text-muted-foreground"
                  disabled={isGeneratingPlan}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset plan
                </Button>
              </div>

            <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Guardrail highlights</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-foreground" />
                  Min deal {formatMoney(guardrails.minDealAmount)}
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Auto approval {formatMoney(guardrails.autoApprovalThreshold)}
                </span>
                {guardrails.usageRightsApproval && (
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-foreground" />
                    Usage rights need approval
                  </span>
                )}
                {guardrails.timelineApproval && (
                  <span className="flex items-center gap-1">
                    <Clock3 className="h-3 w-3" />
                    Timeline escalates
                  </span>
                )}
                {guardrails.autoDeclineNonAligned && (
                  <span className="flex items-center gap-1">
                    <X className="h-3 w-3 text-destructive" />
                    Auto-decline misaligned
                  </span>
                )}
              </div>
            </div>

            {generationError && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {generationError}
              </div>
            )}
          </Card>

          <Card className="p-6 border border-border space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-foreground">Counter email draft</h3>
              <p className="text-sm text-muted-foreground">
                Review or copy the AI assistant&apos;s suggested reply before sending.
              </p>
            </div>
            <Textarea
              value={negotiationPlan.emailDraft}
              readOnly
              spellCheck={false}
              className="h-48 resize-none bg-muted/30 text-sm text-muted-foreground"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function calculateRecommendation(baseAmount: number, guardrails: NegotiationGuardrails, rateCardTotal: number) {
  const safeAmount = Math.max(baseAmount, 0)
  const rateBaseline = Math.max(rateCardTotal, 0)
  const prefersRate = rateBaseline > 0 ? rateBaseline : safeAmount
  const baseline = Math.max(prefersRate, guardrails.minDealAmount)

  const targetIncrease = baseline * 0.15
  const roundedRaise = Math.round((baseline + targetIncrease) / 100) * 100
  const recommendedCounter = Math.max(roundedRaise || baseline, guardrails.autoApprovalThreshold || 0)
  const comparisonAmount = safeAmount || baseline
  const percentageIncrease =
    comparisonAmount > 0 ? Math.round(((recommendedCounter - comparisonAmount) / comparisonAmount) * 100) : 0

  const rationale = []

  if (rateBaseline > 0) {
    rationale.push(`Rate card baseline totals ${formatMoney(rateBaseline)} for the requested deliverables.`)
  }

  if (safeAmount > 0) {
    rationale.push(`Brand's current offer is ${formatMoney(safeAmount)}.`)
  }

  rationale.push(`Minimum deal amount is ${formatMoney(guardrails.minDealAmount)}.`)
  rationale.push(`Countering at ${formatMoney(recommendedCounter)} delivers a ${percentageIncrease}% uplift.`)

  if (guardrails.usageRightsApproval) {
    rationale.push("Usage rights requests require approval—AI will guard against unpaid usage.")
  }
  if (guardrails.timelineApproval) {
    rationale.push("Timeline changes will be escalated before accepting.")
  }

  return {
    recommendedCounter,
    percentageIncrease,
    rationale,
  }
}

function buildCounterEmail(
  deal: DetailedDeal | null,
  counterAmount: number,
  breakdown: ReturnType<typeof summarizeDeliverables>["breakdown"],
  guardrails: NegotiationGuardrails,
) {
  const brandName = deal?.company ?? "there"
  const deliverableLines = breakdown
    .map((item) => {
      if (item.unitPrice <= 0) {
        return `• ${item.label} — pricing needed`
      }
      const countLabel =
        item.packSize > 1 ? `${item.units} × ${item.packSize}-pack (${item.count} total)` : `${item.count} total`
      return `• ${item.label}: ${countLabel} — ${formatMoney(item.total)}`
    })
    .join("\n")

  const fallbackLine = breakdown.length === 0 ? "• Deliverables TBD" : deliverableLines

  const guardrailNote = guardrails.usageRightsApproval
    ? "Usage rights still require approval."
    : "Happy to discuss usage if you need flexibility."

  return `Hi ${brandName},

Thanks for sharing the scope. I can approve this at ${formatMoney(counterAmount)} based on:

${fallbackLine}

This keeps us in line with campaign benchmarks and meets the minimum deal size of ${formatMoney(guardrails.minDealAmount)}. ${guardrailNote}

Let me know if this works or if we should adjust anything.

Best,
The Griphyn Team`
}

function parseCurrencyValue(value?: string | null) {
  if (!value) return 0
  const numeric = Number(value.replace(/[^0-9.-]/g, ""))
  return Number.isFinite(numeric) ? numeric : 0
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function summarizeDeliverables(
  deliverables: DetailedDeal["creativeBrief"]["deliverables"],
  rateCard: RateCardEntry[],
) {
  const breakdown = deliverables.map((item, index) => {
    const key = deriveDeliverableKey(item.type, item.count)
    const rate = rateCard.find((entry) => entry.deliverableKey === key)
    const unitPrice = rate?.price ?? 0
    const packSize = getPackSizeForKey(key)
    const units = packSize > 1 ? Math.ceil(item.count / packSize) : item.count
    const total = unitPrice * units
    return {
      id: `${key}-${index}`,
      label: item.type,
      count: item.count,
      unitPrice,
      units,
      packSize,
      total,
    }
  })

  const total = breakdown.reduce((sum, item) => sum + item.total, 0)

  return { total, breakdown }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/set of\s*(\d+)/i, (_, group1) => `${group1}-pack`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function deriveDeliverableKey(type: string, count: number) {
  const normalized = type.toLowerCase()

  if (normalized.includes("story")) {
    if ((/3/.test(normalized) && !/single/.test(normalized)) || count >= 3) {
      return count % 3 === 0 ? "instagram-stories-3" : "instagram-story-single"
    }
    return "instagram-story-single"
  }

  if (normalized.includes("reel")) {
    return "instagram-reel"
  }

  if (normalized.includes("instagram") && normalized.includes("post")) {
    return "instagram-feed-post"
  }

  if (normalized.includes("spark")) {
    return "tiktok-spark-ad"
  }

  if (normalized.includes("tiktok")) {
    return "tiktok-feed-post"
  }

  if (normalized.includes("youtube")) {
    if (normalized.includes("short")) {
      return "youtube-short"
    }
    return "youtube-video"
  }

  if (normalized.includes("podcast")) {
    return "podcast-host-read"
  }

  if (normalized.includes("newsletter")) {
    return "newsletter-feature"
  }

  if (normalized.includes("blog")) {
    return "blog-post"
  }

  return slugify(type)
}

function getPackSizeForKey(key: string) {
  const preset = DELIVERABLE_PRESETS.find((item) => item.deliverableKey === key)
  return preset?.packSize ?? 1
}

function mapSampleDealToDetail(deal: (typeof sampleDeals)[number], id: string): DetailedDeal {
  return {
    id,
    deal: deal.deal,
    company: deal.company,
    email: deal.email,
    amount: deal.amount,
    stage: deal.stage,
    closeDate: deal.closeDate,
    goLiveDate: deal.goLiveDate,
    source: deal.source,
    usageRights: deal.usageRights,
    paymentStatus: deal.paymentStatus,
    summary: deal.creativeBrief.objective,
    aiSummary: deal.creativeBrief.objective,
    aiConfidence: null,
    inboundEmailBody: null,
    creativeBrief: deal.creativeBrief,
    agentTimeline: deal.agentTimeline,
  }
}

function mapApiDealToDetail(deal: NonNullable<ApiDealResponse["data"]>): DetailedDeal {
  const metadata = parseMetadata(deal.metadata)
  const bodyFromParsed = extractBodyFromParsedData(deal.inboundEmail?.parsedData)
  const stage = mapStatusToStage(deal.status)

  return {
    id: deal.id,
    deal: deal.title ?? deal.inboundEmail?.subject ?? "New brand opportunity",
    company:
      metadata.brandName ??
      deal.brand?.name ??
      deal.inboundEmail?.fromAddress ??
      "Unknown brand",
    email: deal.brand?.contactEmail ?? deal.inboundEmail?.fromAddress ?? "unknown",
    amount: formatCurrency(
      typeof deal.estimatedValue === "number" ? deal.estimatedValue : metadata.estimatedValue ?? null,
      deal.currencyCode ?? "USD",
    ),
    stage,
    closeDate: formatDate(deal.updatedAt),
    goLiveDate: formatDate(deal.dueDate ?? deal.createdAt),
    source: deal.source === "EMAIL" ? "Inbound" : "Outbound",
    usageRights: metadata.usageRights ?? "Review required",
    paymentStatus:
      metadata.paymentStatus ??
      (stage === "Closed Won" ? "Paid" : stage === "Closed Lost" ? "N/A" : "Awaiting Payment"),
    summary: deal.summary ?? metadata.summary ?? "Summary pending",
    aiSummary: typeof metadata.aiSummary === "string" ? metadata.aiSummary : deal.aiSummary,
    aiConfidence: typeof metadata.aiConfidence === "number" ? metadata.aiConfidence : null,
    inboundEmailBody: bodyFromParsed ?? metadata.bodyText ?? null,
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

function extractBodyFromParsedData(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as { bodyText?: string }
    return typeof parsed.bodyText === "string" ? parsed.bodyText : null
  } catch (err) {
    console.warn("Failed to parse inbound email parsedData", err)
    return null
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
