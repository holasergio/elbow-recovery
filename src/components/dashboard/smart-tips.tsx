'use client'

import { useSmartTips, type SmartTip } from '@/hooks/use-smart-tips'
import { Lightning, Moon, Warning, TrendUp, Fire, Calendar, Ruler, Clock, Pill, Target } from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const iconMap: Record<string, Icon> = { Lightning, Moon, Warning, TrendUp, Fire, Calendar, Ruler, Clock, Pill, Target }

const categoryColors: Record<SmartTip['category'], string> = {
  exercise: 'var(--color-primary)',
  sleep: 'var(--color-info)',
  nutrition: 'var(--color-accent)',
  pain: 'var(--color-error)',
  progress: 'var(--color-success)',
  motivation: 'var(--color-warning)',
}

export function SmartTips() {
  const tips = useSmartTips()

  if (tips.length === 0) return null

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 12,
    }}>
      <p style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        margin: 0,
      }}>
        Умные советы
      </p>
      {tips.map(tip => {
        const IconComp = iconMap[tip.icon] || Lightning
        const color = categoryColors[tip.category]
        return (
          <div key={tip.id} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: `color-mix(in srgb, ${color} 8%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 15%, transparent)`,
          }}>
            <IconComp size={16} weight="duotone" style={{ color, flexShrink: 0, marginTop: 2 }} />
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text)',
              margin: 0,
              lineHeight: 1.5,
            }}>
              {tip.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}
