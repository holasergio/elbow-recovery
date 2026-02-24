'use client'

import { achievements, type AchievementDef } from '@/data/achievements'
import { useAppStore } from '@/stores/app-store'
import {
  Trophy, Fire, Play, CheckCircle, Barbell, Pill, Ruler,
  TrendUp, Star, Moon, Target, Crown, Lock,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

const iconMap: Record<string, Icon> = {
  Fire, Trophy, Play, CheckCircle, Barbell, Pill, Ruler, TrendUp, Star, Moon, Target, Crown,
}

function getLevel(xp: number): { level: number; currentXP: number; nextLevelXP: number } {
  const level = Math.floor(xp / 200) + 1
  const currentXP = xp % 200
  return { level, currentXP, nextLevelXP: 200 }
}

function AchievementCard({ def, unlocked }: { def: AchievementDef; unlocked: number | null }) {
  const isUnlocked = unlocked !== null
  const IconComp = iconMap[def.icon] || Trophy

  return (
    <div style={{
      padding: 16,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: isUnlocked ? 'var(--color-surface)' : 'var(--color-surface-alt)',
      border: `1px solid ${isUnlocked ? 'var(--color-primary)' : 'var(--color-border)'}`,
      opacity: isUnlocked ? 1 : 0.6,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 8,
      position: 'relative',
    }}>
      {!isUnlocked && (
        <Lock size={14} weight="bold" style={{
          position: 'absolute', top: 8, right: 8,
          color: 'var(--color-text-muted)',
        }} />
      )}
      <div style={{
        width: 48, height: 48,
        borderRadius: 'var(--radius-full)',
        backgroundColor: isUnlocked ? 'var(--color-primary-light)' : 'var(--color-surface-alt)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <IconComp
          size={24}
          weight="duotone"
          style={{ color: isUnlocked ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        />
      </div>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        color: isUnlocked ? 'var(--color-text)' : 'var(--color-text-muted)',
      }}>
        {def.name}
      </span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
        {def.description}
      </span>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        color: isUnlocked ? 'var(--color-accent)' : 'var(--color-text-muted)',
      }}>
        +{def.xp} XP
      </span>
      {isUnlocked && (
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
          {new Date(unlocked).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </span>
      )}
    </div>
  )
}

export default function AchievementsPage() {
  const { unlockedAchievements, totalXP } = useAppStore()
  const { level, currentXP, nextLevelXP } = getLevel(totalXP)
  const unlockedCount = Object.keys(unlockedAchievements).length

  return (
    <div className="py-6" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Trophy size={28} weight="duotone" style={{ color: 'var(--color-accent)' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 600 }}>
            Достижения
          </h1>
        </div>
        <p className="mt-2" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
          {unlockedCount} из {achievements.length} открыто
        </p>
      </div>

      {/* Level + XP bar */}
      <div style={{
        padding: 20,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-accent)',
          }}>
            Ур. {level}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {totalXP} XP
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 8, borderRadius: 4,
          backgroundColor: 'var(--color-surface-alt)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(currentXP / nextLevelXP) * 100}%`,
            borderRadius: 4,
            backgroundColor: 'var(--color-accent)',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {currentXP} / {nextLevelXP} XP до уровня {level + 1}
        </span>
      </div>

      {/* Badge grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
      }}>
        {achievements.map((def) => (
          <AchievementCard
            key={def.id}
            def={def}
            unlocked={unlockedAchievements[def.id] ?? null}
          />
        ))}
      </div>
    </div>
  )
}
