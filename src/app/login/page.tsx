'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Envelope, Lock, SpinnerGap } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        })
        if (signUpError) {
          setError(signUpError.message)
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        })
        if (signInError) {
          setError(signInError.message)
          return
        }
      }

      router.push('/')
      router.refresh()
    } catch {
      setError('Что-то пошло не так')
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
      <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
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
            {isSignUp ? 'Создайте аккаунт' : 'Войдите, чтобы данные не терялись'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
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
              placeholder="Email"
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

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Lock
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              required
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
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
            disabled={loading || !email.trim() || !password.trim()}
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
              opacity: loading || !email.trim() || !password.trim() ? 0.6 : 1,
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading && <SpinnerGap size={20} weight="bold" className="animate-spin" />}
            {isSignUp ? 'Создать аккаунт' : 'Войти'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError('') }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            fontSize: 'var(--text-sm)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            marginTop: '16px',
            padding: '8px',
          }}
        >
          {isSignUp ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Создать'}
        </button>
      </div>
    </div>
  )
}
