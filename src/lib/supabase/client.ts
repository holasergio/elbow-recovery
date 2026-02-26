import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzibkuxugnshhnoxklcf.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aWJrdXh1Z25zaGhub3hrbGNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNjA2NTAsImV4cCI6MjA4NzYzNjY1MH0.PNDok-S8FG9X76sam64s0tT2skCHPoe89-RZLuTYTC0'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookieEncoding: 'raw',
  })
}
