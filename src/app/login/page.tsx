'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Envelope, PaperPlaneTilt, CheckCircle, SpinnerGap } from '@phosphor-icons/react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      setSent(true)
    } catch {
      setError('Не удалось отправить ссылку')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          textAlign: 'center',
        }}
      >
        {/* Logo / Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: '0 0 8px 0',
            }}
          >
            Elbow Recovery
          </h1>
          <p
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}
          >
            Войдите, чтобы данные синхронизировались и не терялись
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div
            style={{
              backgroundColor: 'var(--color-primary-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              border: '1px solid var(--color-primary)',
            }}
          >
            <CheckCircle
              size={48}
              weight="fill"
              style={{ color: 'var(--color-primary)', marginBottom: '12px' }}
            />
            <h2
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                margin: '0 0 8px 0',
              }}
            >
              Проверьте почту
            </h2>
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                margin: '0 0 16px 0',
                lineHeight: 1.5,
              }}
            >
              Мы отправили ссылку для входа на <strong>{email}</strong>. Откройте письмо и нажмите на ссылку.
            </p>
            <button
              type="button"
              onClick={() => { setSent(false); setEmail('') }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Отправить ещё раз
            </button>
          </div>
        ) : (
          /* Login form */
          <form onSubmit={handleSubmit}>
            <div
              style={{
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <Envelope
                size={20}
                weight="duotone"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                required
                autoComplete="email"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  fontSize: 'var(--text-base)',
                  fontFamily: 'inherit',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-error, #dc2626)',
                  margin: '0 0 12px 0',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                fontFamily: 'inherit',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading || !email.trim() ? 0.6 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              {loading ? (
                <SpinnerGap size={20} weight="bold" className="animate-spin" />
              ) : (
                <PaperPlaneTilt size={20} weight="duotone" />
              )}
              {loading ? 'Отправляем...' : 'Получить ссылку для входа'}
            </button>
          </form>
        )}

        <p
          style={{
            fontSize: '12px',
            color: 'var(--color-text-muted)',
            marginTop: '24px',
            lineHeight: 1.5,
          }}
        >
          Без пароля. Ссылка для входа придёт на email — нажмите и вы в приложении.
        </p>
      </div>
    </div>
  )
}
