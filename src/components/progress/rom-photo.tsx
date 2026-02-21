'use client'

import { useRef, useState, useCallback } from 'react'
import { Camera, Trash } from '@phosphor-icons/react'

async function compressImage(file: File, maxSize = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = url
  })
}

interface ROMPhotoProps {
  label: string
  value?: string
  onChange: (dataUrl: string | undefined) => void
}

export function ROMPhoto({ label, value, onChange }: ROMPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    try {
      const compressed = await compressImage(file)
      onChange(compressed)
    } catch {
      console.error('Failed to compress image')
    } finally {
      setIsCompressing(false)
      // Reset input so the same file can be re-selected
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }, [onChange])

  const handleRemove = useCallback(() => {
    onChange(undefined)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [onChange])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <span style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)',
        fontWeight: 500,
      }}>
        {label}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label={label}
      />

      {value ? (
        <div style={{ position: 'relative', width: '120px', height: '120px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            aria-label={`Удалить ${label.toLowerCase()}`}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-error)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Trash size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isCompressing}
          style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--color-border)',
            backgroundColor: 'var(--color-surface-alt)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isCompressing ? 'wait' : 'pointer',
            color: 'var(--color-text-muted)',
            transition: 'border-color 0.2s, background-color 0.2s',
          }}
          aria-label={`Сделать ${label.toLowerCase()}`}
        >
          <Camera size={28} weight="duotone" />
          <span style={{ fontSize: 'var(--text-xs)' }}>
            {isCompressing ? 'Сжатие...' : 'Фото'}
          </span>
        </button>
      )}
    </div>
  )
}
