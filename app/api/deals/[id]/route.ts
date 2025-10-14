import { NextRequest, NextResponse } from "next/server"

const DEFAULT_BASE_URL = "http://localhost:4000"

const buildTargetUrl = (id: string) => {
  const baseUrl = process.env.DEALS_API_BASE_URL ?? DEFAULT_BASE_URL
  return `${baseUrl.replace(/\/+$/, "")}/api/deals/${encodeURIComponent(id)}`
}

export async function GET(_request: NextRequest, context: { params: { id?: string } }) {
  const id = context.params.id

  if (!id) {
    return NextResponse.json({ error: "Deal id is required" }, { status: 400 })
  }

  try {
    const targetUrl = buildTargetUrl(id)
    const response = await fetch(targetUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    const contentType = response.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json") ? await response.json() : await response.text()

    if (!response.ok) {
      const errorBody = typeof payload === "string" ? { error: payload || "Failed to fetch deal" } : payload
      return NextResponse.json(errorBody, { status: response.status })
    }

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error("Failed to proxy deal request:", error)
    return NextResponse.json({ error: "Failed to fetch deal" }, { status: 500 })
  }
}
