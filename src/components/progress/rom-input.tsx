'use client'

import { useState, useCallback } from 'react'
import { FloppyDisk, CheckCircle, Crosshair, Trophy, Target, ArrowUp } from '@phosphor-icons/react'
import { db } from '@/lib/db'
import { getCurrentPhase } from '@/data/patient'
import { phases } from '@/data/phases'
import { ROMPhoto } from './rom-photo'
import { AngleMeasurer } from './angle-measurer'
import { interpretROM } from '@/lib/rom-interpretation'
import { useROMHistory } from '@/hooks/use-rom'

function getArcColor(arc: number, targetMin: number): string {
  if (arc >= targetMin) return 'var(--color-success)'
  if (arc >= targetMin * 0.8) return 'var(--color-warning)'
  return 'var(--color-error)'
}

interface NumberFieldProps {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}

function NumberField({ label, value, onChange, min, max }: NumberFieldProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label style={{
        color: 'var(--color-text-secondary)',
        minWidth: '120px',
        fontSize: 'var(--text-sm)',
        fontWeight: 500,
      }}>
        {label}
      </label>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (!isNaN(v) && v >= min && v <= max) onChange(v)
          else if (e.target.value === '') onChange(0)
        }}
        min={min}
        max={max}
        style={{
          width: '100px',
          height: '48px',
          textAlign: 'center',
          fontSize: 'var(--text-xl)',
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      />
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-lg)' }}>°</span>
    </div>
  )
}

export function ROMInput() {
  const [flexion, setFlexion] = useState(0)
  const [extensionDeficit, setExtensionDeficit] = useState(0)
  const [pronation, setPronation] = useState(0)
  const [supination, setSupination] = useState(0)
  const [measuredBy, setMeasuredBy] = useState<'self' | 'physio'>('self')
  const [photoFlexion, setPhotoFlexion] = useState<string | undefined>()
  const [photoExtension, setPhotoExtension] = useState<string | undefined>()
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [analyzingPhoto, setAnalyzingPhoto] = useState<string | null>(null)
  const [analyzeTarget, setAnalyzeTarget] = useState<'flexion' | 'extension'>('flexion')
  const [aiFlexion, setAiFlexion] = useState<number | undefined>()
  const [aiExtension, setAiExtension] = useState<number | undefined>()

  const arc = flexion - extensionDeficit
  const phaseNum = getCurrentPhase()
  const phase = phases.find(p => p.number === phaseNum)
  const targetMin = phase?.romTarget.min ?? 0
  const targetMax = phase?.romTarget.max ?? 180

  const { measurements } = useROMHistory()
  const previousArc = measurements && measurements.length > 1 ? measurements[measurements.length - 2]?.arc : undefined

  const handleAngleResult = useCallback((angle: number) => {
    if (analyzeTarget === 'flexion') {
      setFlexion(angle)
      setAiFlexion(angle)
    } else {
      const deficit = Math.max(0, 180 - angle)
      setExtensionDeficit(deficit)
      setAiExtension(deficit)
    }
    setAnalyzingPhoto(null)
  }, [analyzeTarget])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      await db.romMeasurements.add({
        date: today,
        flexion,
        extensionDeficit,
        pronation: pronation > 0 ? pronation : undefined,
        supination: supination > 0 ? supination : undefined,
        arc,
        photoFlexion,
        photoExtension,
        measuredBy,
        notes: notes.trim() || undefined,
        aiMeasuredFlexion: aiFlexion,
        aiMeasuredExtension: aiExtension,
      })

      setSaved(true)
      // Reset form after short delay
      setTimeout(() => {
        setFlexion(0)
        setExtensionDeficit(0)
        setPronation(0)
        setSupination(0)
        setMeasuredBy('self')
        setPhotoFlexion(undefined)
        setPhotoExtension(undefined)
        setNotes('')
        setAiFlexion(undefined)
        setAiExtension(undefined)
        setSaved(false)
      }, 3000)
    } catch (err) {
      console.error('Failed to save ROM measurement:', err)
    } finally {
      setIsSaving(false)
    }
  }, [flexion, extensionDeficit, pronation, supination, arc, photoFlexion, photoExtension, measuredBy, notes, isSaving, aiFlexion, aiExtension])

  if (saved) {
    const interp = interpretROM(arc, phaseNum, targetMin, targetMax, previousArc)
    return (
      <div style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--color-surface)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={48} weight="duotone" style={{ color: 'var(--color-success)', margin: '0 auto 8px' }} />
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text)' }}>
            Замер сохранён
          </p>
        </div>

        {/* Big angle */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: interp.phaseStatus === 'ahead' ? 'var(--color-primary-light)' : interp.phaseStatus === 'on-track' ? 'var(--color-primary-light)' : 'color-mix(in srgb, var(--color-warning) 10%, transparent)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
            {arc}°
          </span>
          {interp.weeklyChange && (
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <ArrowUp size={14} weight="bold" style={{ color: 'var(--color-success)' }} />
              {interp.weeklyChange}
            </p>
          )}
        </div>

        {/* Summary */}
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          {interp.summary}
        </p>

        {/* Next milestone */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px', borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-accent-light)',
        }}>
          <Target size={18} weight="duotone" style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{interp.functionalNext}</span>
        </div>

        {/* Can do */}
        {interp.canDo.length > 0 && (
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-success)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Доступно сейчас
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {interp.canDo.map(item => (
                <span key={item} style={{
                  fontSize: 'var(--text-xs)', padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
                  color: 'var(--color-success)',
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cant yet — show only next 3 */}
        {interp.cantYet.length > 0 && (
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Следующие цели
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {interp.cantYet.slice(0, 3).map(item => (
                <span key={item} style={{
                  fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Phase target banner */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-primary-light)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
          Цель фазы {phaseNum}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--color-primary)',
        }}>
          {targetMin}–{targetMax}°
        </span>
      </div>

      {/* Flexion */}
      <NumberField label="Сгибание" value={flexion} onChange={setFlexion} min={0} max={180} />
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '-12px', lineHeight: 1.4 }}>
        Угол максимального сгибания. Согните руку и измерьте угол между плечом и предплечьем.
      </p>

      {/* Extension deficit */}
      <NumberField label="Дефицит разг." value={extensionDeficit} onChange={setExtensionDeficit} min={0} max={90} />
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '-12px', lineHeight: 1.4 }}>
        Сколько градусов не хватает до полного разгибания. 0° = рука полностью прямая.
      </p>

      {/* Computed arc */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface-alt)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Дуга движения
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          fontWeight: 700,
          color: getArcColor(arc, targetMin),
        }}>
          {arc}°
        </span>
      </div>

      {/* Separator */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Pronation / Supination (optional) */}
      <div>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: '4px' }}>
          Ротация предплечья
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          Необязательно. Согни локоть 90° и прижми к телу.
        </p>
      </div>

      <div>
        <NumberField label="Пронация" value={pronation} onChange={setPronation} min={0} max={180} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px', marginLeft: '132px', lineHeight: 1.4 }}>
          Вращение ладонью вниз. Норма: 75–80°
        </p>
      </div>

      <div>
        <NumberField label="Супинация" value={supination} onChange={setSupination} min={0} max={180} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '4px', marginLeft: '132px', lineHeight: 1.4 }}>
          Вращение ладонью вверх. Норма: 80–85°
        </p>
      </div>

      {/* Separator */}
      <div style={{ borderTop: '1px solid var(--color-border)' }} />

      {/* Measured by — segmented control */}
      <div>
        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          display: 'block',
          marginBottom: '8px',
        }}>
          Кто измерял
        </span>
        <div style={{
          display: 'flex',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}>
          <button
            type="button"
            onClick={() => setMeasuredBy('self')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              backgroundColor: measuredBy === 'self' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: measuredBy === 'self' ? '#FFFFFF' : 'var(--color-text-secondary)',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            aria-pressed={measuredBy === 'self'}
          >
            Самостоятельно
          </button>
          <button
            type="button"
            onClick={() => setMeasuredBy('physio')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderLeft: '1px solid var(--color-border)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              backgroundColor: measuredBy === 'physio' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: measuredBy === 'physio' ? '#FFFFFF' : 'var(--color-text-secondary)',
              transition: 'background-color 0.2s, color 0.2s',
            }}
            aria-pressed={measuredBy === 'physio'}
          >
            Физиотерапевт
          </button>
        </div>
      </div>

      {/* Photo guide for AI measurement */}
      <div style={{
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-accent-light)',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
      }}>
        <Crosshair size={18} weight="duotone" style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          <strong>AI-замер:</strong> Сфотографируйте руку сбоку, чтобы были видны плечо, локоть и запястье. После загрузки нажмите «AI».
        </p>
      </div>

      {/* Photo capture */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <ROMPhoto
          label="Фото сгибания"
          value={photoFlexion}
          onChange={setPhotoFlexion}
          onMeasureAngle={photoFlexion ? () => {
            setAnalyzeTarget('flexion')
            setAnalyzingPhoto(photoFlexion)
          } : undefined}
        />
        <ROMPhoto
          label="Фото разгибания"
          value={photoExtension}
          onChange={setPhotoExtension}
          onMeasureAngle={photoExtension ? () => {
            setAnalyzeTarget('extension')
            setAnalyzingPhoto(photoExtension)
          } : undefined}
        />
      </div>

      {/* Notes */}
      <div>
        <label style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
          display: 'block',
          marginBottom: '8px',
        }}>
          Заметки
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ощущения, обстоятельства замера..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: 'var(--text-sm)',
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || flexion === 0}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: (isSaving || flexion === 0) ? 'var(--color-border)' : 'var(--color-primary)',
          color: (isSaving || flexion === 0) ? 'var(--color-text-muted)' : '#FFFFFF',
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          cursor: (isSaving || flexion === 0) ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s, color 0.2s',
        }}
        aria-label="Сохранить замер"
      >
        <FloppyDisk size={20} weight="duotone" />
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </button>

      {analyzingPhoto && (
        <AngleMeasurer
          photoDataUrl={analyzingPhoto}
          onResult={handleAngleResult}
          onClose={() => setAnalyzingPhoto(null)}
        />
      )}
    </div>
  )
}
