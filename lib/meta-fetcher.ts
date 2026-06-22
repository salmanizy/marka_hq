// lib/meta-fetcher.ts
import { createClient } from "@/utils/supabase/server"

const CACHE_DURATION = 60 * 60 * 1000 // 1 Jam
const META_VERSION = "v25.0"

export async function getCachedMetaData(actId: string, since?: string | null, until?: string | null) {
  const supabase = await createClient()
  const cacheKey = `meta_insights_${actId}_${since || "default"}_${until || "default"}`
  const now = Date.now()

  // 1. Cek cache dengan menangkap objek error
  const { data: cached, error: selectError } = await supabase
    .from("api_caches")
    .select("*")
    .eq("cache_key", cacheKey)
    .single()

  // JIKA ADA ERROR SELAIN "DATA NOT FOUND", LOG KE TERMINAL
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

  const res = await fetch(url)
  if (!res.ok) throw new Error(await res.text())

  const freshData = await res.json()

  // 2. Simpan cache dengan menangkap objek error
  const { error: upsertError } = await supabase.from("api_caches").upsert({
    cache_key: cacheKey,
    data: freshData,
    last_fetched: new Date().toISOString()
  }, { onConflict: "cache_key" })

  // JIKA GAGAL MENYIMPAN, LOG KE TERMINAL
  if (upsertError) {
    console.error("❌ [SUPABASE UPSERT ERROR]:", upsertError.message)
  }

  return freshData
}

// Lakukan hal yang sama untuk fungsi getCachedClientList lu (tambahkan log error upsert/select)
export async function getCachedClientList(businessId: string) {
  const supabase = await createClient()
  const cacheKey = `meta_client_list_${businessId}`
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
    if (now - lastFetched < CACHE_DURATION) {
      console.log(`⚡ [CACHE HIT] Client List dari Supabase`)
      return cached.data
    }
  }

  console.log(`🐌 [CACHE MISS] Nembak Meta Client List untuk BM ${businessId}...`)
  const accessToken = process.env.META_ACCESS_TOKEN
  const url = `https://graph.facebook.com/${META_VERSION}/${businessId}?fields=owned_ad_accounts{name,account_id},client_ad_accounts{name,account_id}&access_token=${accessToken}`
  
  const res = await fetch(url)
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