import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      gap: '24px',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1f2e 100%)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#00d4ff',
          marginBottom: '8px'
        }}>
          DocMind RAG
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#64748b',
          marginBottom: '40px'
        }}>
          Vectorless Document Intelligence
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link href="/upload" style={{
          padding: '14px 32px',
          background: '#00d4ff',
          color: '#0f1117',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          Upload Document
        </Link>

        <Link href="/chat" style={{
          padding: '14px 32px',
          background: 'transparent',
          color: '#00d4ff',
          border: '1px solid #00d4ff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          Start Chatting
        </Link>
      </div>
    </main>
  )
}