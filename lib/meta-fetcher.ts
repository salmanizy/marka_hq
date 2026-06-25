// lib/meta-fetcher.ts
import { createClient } from "@/utils/supabase/server"

const CACHE_DURATION = 60 * 60 * 1000 // 1 jam - untuk insights
const CLIENT_LIST_CACHE_DURATION = 3 * 60 * 60 * 1000 // 3 jam
const META_VERSION = "v25.0"

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url)

    if (res.status === 429) {
      const waitMs = Math.pow(2, i) * 1000 // 1s, 2s, 4s
      console.warn(`⚠️ [RATE LIMIT] Retry ${i + 1}/${retries} in ${waitMs}ms...`)
      await new Promise(r => setTimeout(r, waitMs))
      continue
    }

    return res
  }
  throw new Error("Meta API rate limit exceeded after retries")
}

export async function getCachedMetaData(actId: string, since?: string | null, until?: string | null) {
  const supabase = await createClient()
  const cacheKey = `meta_insights_${actId}_${since || "default"}_${until || "default"}`
  const now = Date.now()

  const { data: cached, error: selectError } = await supabase
    .from("api_caches")
    .select("*")
    .eq("cache_key", cacheKey)
    .single()

  if (selectError && selectError.code !== "PGRST116") {
    console.error("❌ [SUPABASE SELECT ERROR]:", selectError.message)
  }

  if (cached) {
    const lastFetched = new Date(cached.last_fetched).getTime()
    if (now - lastFetched < CACHE_DURATION) {
      console.log(`⚡ [CACHE HIT] Insights ${actId} dari Supabase`)
      return cached.data
    }
  }

  console.log(`🐌 [CACHE MISS] Nembak Meta Insights untuk ${actId}...`)
  const accessToken = process.env.META_ACCESS_TOKEN
  const timeParam = since && until
    ? `time_range=${encodeURIComponent(JSON.stringify({ since, until }))}`
    : "date_preset=last_30d"

  const fields = "account_name,spend,impressions,clicks,ctr,cpc,reach,frequency,cpm,purchase_roas,actions,action_values,cost_per_action_type"
  const url = `https://graph.facebook.com/${META_VERSION}/${actId}/insights?fields=${fields}&${timeParam}&access_token=${accessToken}`

  const res = await fetchWithRetry(url)
  if (!res.ok) throw new Error(await res.text())

  const freshData = await res.json()

  const { error: upsertError } = await supabase.from("api_caches").upsert({
    cache_key: cacheKey,
    data: freshData,
    last_fetched: new Date().toISOString()
  }, { onConflict: "cache_key" })

  if (upsertError) {
    console.error("❌ [SUPABASE UPSERT ERROR]:", upsertError.message)
  }

  return freshData
}

export async function getCachedClientList() {
  const supabase = await createClient()
  const cacheKey = `meta_client_list_me`
  const now = Date.now()

  const { data: cached, error: selectError } = await supabase
    .from("api_caches")
    .select("*")
    .eq("cache_key", cacheKey)
    .single()

  if (selectError && selectError.code !== "PGRST116") {
    console.error("❌ [SUPABASE CLIENT SELECT ERROR]:", selectError.message)
  }

  if (cached) {
    const lastFetched = new Date(cached.last_fetched).getTime()
    const diff = now - lastFetched
    console.log(`🕐 Cache age: ${Math.round(diff / 1000 / 60)} menit, CACHE_DURATION: ${CLIENT_LIST_CACHE_DURATION / 1000 / 60} menit`)
    if (now - lastFetched < CLIENT_LIST_CACHE_DURATION) {
      console.log(`⚡ [CACHE HIT] Client List dari Supabase`)
      return cached.data
    }
  }

  console.log(`🐌 [CACHE MISS] Nembak Meta Client List...`)
  const accessToken = process.env.META_ACCESS_TOKEN
  const url = `https://graph.facebook.com/${META_VERSION}/me/adaccounts?fields=name,account_id,id,account_status&limit=50&access_token=${accessToken}`

  const res = await fetchWithRetry(url)
  if (!res.ok) throw new Error(await res.text())

  const freshData = await res.json()

  const { error: upsertError } = await supabase.from("api_caches").upsert({
    cache_key: cacheKey,
    data: freshData,
    last_fetched: new Date().toISOString()
  }, { onConflict: "cache_key" })

  if (upsertError) {
    console.error("❌ [SUPABASE CLIENT UPSERT ERROR]:", upsertError.message)
  }

  return freshData
}