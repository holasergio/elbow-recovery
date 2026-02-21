export default function OfflinePage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-body), system-ui, sans-serif',
        backgroundColor: '#FAFAF7',
        color: '#1A1917',
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}
      >
        Нет соединения
      </h1>
      <p
        style={{
          fontSize: '1rem',
          color: '#6B7280',
          maxWidth: '320px',
          lineHeight: 1.6,
        }}
      >
        Проверьте подключение к интернету и попробуйте снова.
      </p>
    </div>
  )
}
