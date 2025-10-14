"use server"

import { NextResponse } from "next/server"
import OpenAI from "openai"

const DEFAULT_MODEL = process.env.OPENAI_NEGOTIATION_MODEL ?? "gpt-4o-mini"

type NegotiationGuardrailsInput = {
  minDealAmount: number
  autoApprovalThreshold: number
  usageRightsApproval: boolean
  timelineApproval: boolean
  autoDeclineNonAligned: boolean
}

type DeliverableBreakdownItem = {
  label: string
  count: number
  unitPrice: number
  units: number
  packSize: number
  total: number
}

type NegotiationRequestPayload = {
  deal: {
    id: string
    name: string
    company: string
    amount: number
    summary: string
    usageRights?: string
    stage?: string
    source?: string
    closeDate?: string
    goLiveDate?: string
  }
  guardrails: NegotiationGuardrailsInput
  currentOffer: number
  deliverableSummary?: {
    total: number
    breakdown: DeliverableBreakdownItem[]
  }
}

type NegotiationPlanResponse = {
  recommendedCounter: number
  rationale: string[]
  emailDraft: string
}

const buildClient = () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return null
  }
  return new OpenAI({ apiKey })
}

const formatMoney = (value: number) => {
  if (!Number.isFinite(value)) {
    return "$0"
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

const buildFallbackEmail = (
  company: string,
  counter: number,
  guardrails: NegotiationGuardrailsInput,
  deliverables?: DeliverableBreakdownItem[],
) => {
  const guardrailNote = guardrails.usageRightsApproval
    ? "Usage rights will still need approval."
    : "Let me know if you need flexibility on usage terms."

  const lines =
    deliverables && deliverables.length > 0
      ? deliverables.map((item) => {
          const breakdown =
            item.packSize > 1 ? `${item.units} × ${item.packSize}-pack (${item.count} total)` : `${item.count} total`
          return `• ${item.label}: ${breakdown} — ${formatMoney(item.total)}`
        })
      : ["• Deliverables TBD — pricing to be confirmed"]

  return `Hi ${company || "there"},

Thanks for sharing the scope. I can approve this at ${formatMoney(counter)} based on:

${lines.join("\n")}

This keeps us in line with required guardrails (minimum deal ${formatMoney(guardrails.minDealAmount)}). ${guardrailNote}

Let me know if this works or if we should adjust anything.

Best,
The Griphyn Team`
}

const sanitizeJsonString = (value: string) => {
  const trimmed = value.trim()
  if (trimmed.startsWith("```")) {
    const jsonBlock = trimmed.replace(/```json/gi, "```").split("```")[1]
    return (jsonBlock ?? "").trim()
  }
  return trimmed
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const client = buildClient()
    if (!client) {
      return NextResponse.json({ error: "Missing OpenAI API key" }, { status: 500 })
    }

    const body = (await request.json()) as NegotiationRequestPayload | null
    if (!body || !body.deal || !body.guardrails) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 })
    }

    const { deal, guardrails, currentOffer, deliverableSummary } = body
    const offerValue = Number.isFinite(currentOffer) ? currentOffer : Number(deal.amount) || 0

    const promptPayload = {
      dealId: params.id,
      deal,
      guardrails,
      currentOffer: offerValue,
      deliverableSummary,
    }

    const response = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior talent agent negotiating brand deals. Provide a JSON object with keys: recommendedCounter (number), rationale (array of 3-5 concise strings), emailDraft (string with newline \\n formatting). Respect guardrail minimums and stay realistic.",
        },
        {
          role: "user",
          content: `Use this structured data to recommend a counter offer, rationale, and response email:\n${JSON.stringify(
            promptPayload,
            null,
            2,
          )}`,
        },
      ],
    })

    const rawContent = response.choices?.[0]?.message?.content
    if (!rawContent) {
      throw new Error("LLM response missing content")
    }

    const parsed = JSON.parse(sanitizeJsonString(rawContent)) as NegotiationPlanResponse
    const recommendedCounter = Number(parsed?.recommendedCounter)
    const safeCounter = Number.isFinite(recommendedCounter)
      ? Math.max(recommendedCounter, guardrails.minDealAmount ?? 0)
      : Math.max(offerValue, guardrails.minDealAmount ?? 0)

    const percentageIncrease =
      offerValue > 0 ? Math.round(((safeCounter - offerValue) / offerValue) * 100) : safeCounter > 0 ? 100 : 0

    const rationale = Array.isArray(parsed?.rationale)
      ? parsed.rationale.filter((item) => typeof item === "string" && item.trim().length > 0)
      : []

    const emailDraft =
      typeof parsed?.emailDraft === "string" && parsed.emailDraft.trim().length > 0
        ? parsed.emailDraft.trim()
        : buildFallbackEmail(deal.company, safeCounter, guardrails, deliverableSummary?.breakdown)

    return NextResponse.json({
      plan: {
        recommendedCounter: safeCounter,
        percentageIncrease,
        rationale,
        emailDraft,
      },
    })
  } catch (error) {
    console.error("Negotiation assistant error:", error)
    return NextResponse.json({ error: "Failed to generate negotiation plan" }, { status: 500 })
  }
}
