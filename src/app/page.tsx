export default function Home() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--color-bg)' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 600, color: 'var(--color-text)' }} className="mb-4">
        Восстановление
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-secondary)' }} className="mb-6">
        Приложение для реабилитации локтевого сустава после ORIF.
      </p>
      <div className="grid gap-3">
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Primary: Sage Green #5B8A72</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Secondary: Terracotta #C4785B</p>
        </div>
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-border)' }}>
          <p style={{ color: 'var(--color-accent)', fontWeight: 500 }}>Accent: Soft Gold #D4A76A</p>
        </div>
      </div>
    </div>
  )
}
