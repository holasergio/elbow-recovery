'use client'

import { useParams } from 'next/navigation'
import { SessionRunner } from '@/components/session/session-runner'

export default function SessionDetailPage() {
  const params = useParams()
  const sessionId = Number(params.id)

  if (isNaN(sessionId) || sessionId < 1 || sessionId > 5) {
    return <div className="py-6"><p>Сессия не найдена</p></div>
  }

  // key forces full remount when sessionId changes or page is revisited
  return <SessionRunner key={`session-${sessionId}-${Date.now()}`} sessionId={sessionId} />
}
