// app/api/insights/[actId]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getCachedMetaData } from "@/lib/meta-fetcher"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ actId: string }> }
) {
  const accessToken = process.env.META_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: "META_ACCESS_TOKEN not configured" }, { status: 500 })
  }

  const { actId } = await params
  const { searchParams } = request.nextUrl

  const since = searchParams.get("since")
  const until = searchParams.get("until")

  try {
    // Panggil fungsi central cache kita
    const data = await getCachedMetaData(actId, since, until)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Route Insights Error:", error)
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data dari Meta API" },
      { status: 500 }
    )
  }
}