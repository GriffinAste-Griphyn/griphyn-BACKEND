import { NextRequest, NextResponse } from "next/server"

const DEFAULT_BASE_URL = "http://localhost:4000"

const buildTargetUrl = (request: NextRequest) => {
  const baseUrl = process.env.DEALS_API_BASE_URL ?? DEFAULT_BASE_URL
  const target = new URL("/api/deals", baseUrl)
  const requestUrl = new URL(request.url)

  requestUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value)
  })

  return target.toString()
}

export async function GET(request: NextRequest) {
  try {
    const targetUrl = buildTargetUrl(request)
    const response = await fetch(targetUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    const contentType = response.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json") ? await response.json() : await response.text()

    if (!response.ok) {
      const errorBody = typeof payload === "string" ? { error: payload || "Failed to fetch deals" } : payload
      return NextResponse.json(errorBody, { status: response.status })
    }

    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    console.error("Failed to proxy deals request:", error)
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 })
  }
}
