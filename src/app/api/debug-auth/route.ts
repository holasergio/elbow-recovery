import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzibkuxugnshhnoxklcf.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aWJrdXh1Z25zaGhub3hrbGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjA2NTAsImV4cCI6MjA4NzYzNjY1MH0.PNDok-S8FG9X76sam64s0tT2skCHPoe89-RZLuTYTC0'

export async function GET() {
  const keyPreview = SUPABASE_ANON_KEY.slice(0, 20) + '...' + SUPABASE_ANON_KEY.slice(-10)
  const envKeyRaw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const envUrlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL

  // Test actual Supabase connection
  let apiTest = 'not tested'
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: { apikey: SUPABASE_ANON_KEY },
    })
    apiTest = `${res.status} ${res.statusText}`
  } catch (e: unknown) {
    apiTest = `error: ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json({
    url: SUPABASE_URL,
    keyLength: SUPABASE_ANON_KEY.length,
    keyPreview,
    envKeySet: envKeyRaw !== undefined,
    envKeyLength: envKeyRaw?.length ?? null,
    envUrlSet: envUrlRaw !== undefined,
    envUrlValue: envUrlRaw ?? null,
    apiTest,
  })
}
