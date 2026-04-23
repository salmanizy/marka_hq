import type { NextRequest } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ actId: string }> }
) {
  const accessToken = process.env.META_ACCESS_TOKEN
  if (!accessToken) {
    return Response.json({ error: "META_ACCESS_TOKEN not configured" }, { status: 500 })
  }

  const { actId } = await params
  const { searchParams } = request.nextUrl

  const since = searchParams.get("since")
  const until = searchParams.get("until")

  const timeParam =
    since && until
      ? `time_range=${encodeURIComponent(JSON.stringify({ since, until }))}`
      : "date_preset=last_30d"

  const url = `https://graph.facebook.com/v25.0/${actId}/insights?fields=spend,impressions,clicks,ctr,cpc,conversions,account_name&${timeParam}&access_token=${accessToken}`

  const res = await fetch(url, { cache: "no-store" })

  if (!res.ok) {
    const body = await res.text()
    return Response.json({ error: body }, { status: res.status })
  }

  const data = await res.json()
  return Response.json(data)
}
