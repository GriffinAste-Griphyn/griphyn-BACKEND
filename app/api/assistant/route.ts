"use server"

import { NextResponse } from "next/server"
import OpenAI from "openai"
import { sampleDeals } from "@/lib/sample-deals"
import { upcomingPayouts, escrowTransactions, invoices } from "@/lib/sample-payments"
import { sampleContracts } from "@/lib/sample-contracts"

const systemPrompt = `You are the Griphyn AI talent agent assistant. Help creators understand their deals, brand outreach, tasks, payments, and creative briefs.

Always follow this Markdown structure when you reply:
- Begin with a single concise summary sentence.
- Insert a blank line.
- Present supporting details as individual "-" bullet points, one per line, grouped logically. Maintain a blank line before the first bullet group and between separate groups.
- End with a blank line followed by a short concluding sentence or recommendation.

Keep answers grounded in the provided context. If information is missing, state that clearly instead of guessing.`

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

const buildClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  return new OpenAI({ apiKey })
}

type DealRecord = {
  id: string
  title: string | null
  summary: string | null
  status: string
  source: string | null
  estimatedValue: number | null
  currencyCode: string | null
  dueDate: string | null
  brand: {
    name: string | null
  } | null
  updatedAt: string
}

const formatCurrency = (value: number | null | undefined, currency = "USD") => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A"
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `$${value.toFixed(0)}`
  }
}

const SAMPLE_DEAL_LIMIT = 5

const buildSampleDealsSummary = () => {
  const fallbackDeals = sampleDeals.slice(0, SAMPLE_DEAL_LIMIT)

  if (fallbackDeals.length === 0) {
    return null
  }

  const lines = fallbackDeals.map((deal) => {
    const parts = [
      `**${deal.deal}** (${deal.company})`,
      `Status: ${deal.stage}`,
      `Source: ${deal.source}`,
      `Value: ${deal.amount}`,
    ]

    if (deal.goLiveDate) {
      parts.push(`Go-live Date: ${deal.goLiveDate}`)
    }

    return `- ${parts.join(" • ")}`
  })

  return `## Deals (sample)\n${lines.join("\n")}`
}

const buildDealContext = async () => {
  const baseUrl = process.env.DEALS_API_BASE_URL ?? "http://localhost:4000"

  try {
    const dealsUrl = new URL("/api/deals", baseUrl)
    dealsUrl.searchParams.set("limit", "6")

    const res = await fetch(dealsUrl.toString(), {
      headers: {
        "Content-Type": "application/json",
      },
      // ensure no caching between calls in dev
      cache: "no-store",
    })

    if (!res.ok) {
      throw new Error(`Deals API responded with ${res.status}`)
    }

    const json = (await res.json()) as { data?: DealRecord[] }
    const deals = json.data ?? []

    if (deals.length > 0) {
      const lines = deals.map((deal) => {
        const title = deal.title ?? deal.summary ?? "Untitled deal"
        const brand = deal.brand?.name ?? "Unknown brand"
        const value = formatCurrency(deal.estimatedValue, deal.currencyCode ?? undefined)
        const status = deal.status?.replace(/_/g, " ") ?? "Unknown"
        const source = (deal.source ?? "EMAIL").toUpperCase()
        const updated = new Date(deal.updatedAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })

        let dueText: string | null = null
        if (deal.dueDate) {
          const dueDate = new Date(deal.dueDate)
          const now = new Date()
          const diffMs = dueDate.getTime() - now.getTime()
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
          const formattedDue = dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
          dueText = diffDays >= 0 ? `Go-live Date: ${formattedDue} (${diffDays} days left)` : `Go-live Date: ${formattedDue} (overdue)`
        }

        const parts = [`**${title}** (${brand})`, `Status: ${status}`, `Source: ${source}`, `Value: ${value}`, `Last Update: ${updated}`]
        if (dueText) {
          parts.splice(4, 0, dueText)
        }

        return `- ${parts.join(" • ")}`
      })

      return `## Deals\n${lines.join("\n")}`
    }

    const fallback = buildSampleDealsSummary()
    return fallback ?? "There are currently no deals recorded."
  } catch (error) {
    console.error("Failed to load deal context:", error)
    return buildSampleDealsSummary()
  }
}

const buildPaymentContext = () => {
  if (!upcomingPayouts.length && !escrowTransactions.length && !invoices.length) {
    return null
  }

  const payoutLines = upcomingPayouts.slice(0, 5).map((payout) => {
    const parts = [
      `**${payout.deal}** (${payout.company})`,
      `Amount: ${payout.amount}`,
      `Due Date: ${payout.dueDate}`,
      `Status: ${payout.status}`,
      `Milestone: ${payout.milestone}`,
    ]
    return `- ${parts.join(" • ")}`
  })

  const invoiceHighlights = invoices
    .filter((invoice) => invoice.status === "Overdue" || invoice.status === "Pending")
    .map((invoice) => {
      const parts = [
        `**${invoice.deal}** (${invoice.company})`,
        `Invoice: ${invoice.id}`,
        `Amount: ${invoice.amount}`,
        `Status: ${invoice.status}`,
        `Issued: ${invoice.issueDate}`,
      ]
      if (invoice.paidDate !== "—") {
        parts.push(`Paid: ${invoice.paidDate}`)
      }
      return `- ${parts.join(" • ")}`
    })

  const escrowNotes = escrowTransactions.slice(0, 5).map((transaction) => {
    const dueDate = new Date(transaction.dealDate)
    dueDate.setDate(dueDate.getDate() + transaction.paymentDueDays)
    const due = dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

    const parts = [
      `**${transaction.deal}** (${transaction.company})`,
      `Amount: ${transaction.amount}`,
      `Terms: ${transaction.paymentTerms}`,
      `Payment Window: ${transaction.paymentDueDays} days`,
      `Expected Payout: ${due}`,
    ]

    return `- ${parts.join(" • ")}`
  })

  const sections: string[] = []

  if (payoutLines.length) {
    sections.push(`## Upcoming Payouts\n${payoutLines.join("\n")}`)
  }

  if (invoiceHighlights.length) {
    sections.push(`## Invoices Needing Attention\n${invoiceHighlights.join("\n")}`)
  }

  if (escrowNotes.length) {
    sections.push(`## Escrow Schedule\n${escrowNotes.join("\n")}`)
  }

  return sections.length ? sections.join("\n\n") : null
}

const buildContractContext = () => {
  if (!sampleContracts.length) {
    return null
  }

  const lines = sampleContracts.slice(0, 5).map((contract) => {
    const parts = [
      `**${contract.deal}** (${contract.brand})`,
      `Status: ${contract.status}`,
      `Effective: ${contract.effectiveDate}`,
    ]

    if (contract.renewalDate) {
      parts.push(`Renewal: ${contract.renewalDate}`)
    }

    parts.push(`Terms: ${contract.termsSummary}`)
    parts.push(`Last Updated: ${contract.lastUpdated}`)

    return `- ${parts.join(" • ")}`
  })

  return `## Contracts\n${lines.join("\n")}`
}

const buildCreativeBriefContext = () => {
  if (!sampleDeals.length) {
    return null
  }

  const lines = sampleDeals.slice(0, SAMPLE_DEAL_LIMIT).map((deal) => {
    const brief = deal.creativeBrief
    const deliverables = brief.deliverables
      .map((item) => `${item.count}× ${item.type} (${item.specs})`)
      .join("; ")
    const talkingPoints = brief.talking_points.join(", ")

    const parts = [
      `**${deal.deal}** (${deal.company})`,
      `Campaign: ${brief.campaign}`,
      `Objective: ${brief.objective}`,
      `Deliverables: ${deliverables}`,
      `Timeline: ${brief.timeline}`,
      `Guidelines: ${brief.brandGuidelines}`,
      `Talking Points: ${talkingPoints}`,
      `Hashtags: ${brief.hashtags}`,
    ]

    return `- ${parts.join(" • ")}`
  })

  return `## Creative Briefs\n${lines.join("\n")}`
}


export async function POST(request: Request) {
  const client = buildClient()

  if (!client) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY – set it in your environment to enable the assistant." },
      { status: 500 },
    )
  }

  try {
    const body = (await request.json()) as { message?: string; history?: ChatMessage[] }
    const userMessage = body.message?.trim()

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 })
    }

    const history = Array.isArray(body.history) ? body.history : []

    const dealContext = await buildDealContext()
    const paymentContext = buildPaymentContext()
    const contractContext = buildContractContext()
    const creativeBriefContext = buildCreativeBriefContext()

    const contextPrompt = [systemPrompt, dealContext, paymentContext, contractContext, creativeBriefContext]
      .filter(Boolean)
      .join("\n\n")

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: contextPrompt },
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 400,
    })

    const reply = response.choices?.[0]?.message?.content?.trim() ?? "I’m not sure how to respond to that."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Assistant API error:", error)
    return NextResponse.json({ error: "Unable to get a response right now." }, { status: 500 })
  }
}
