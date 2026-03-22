'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API = 'http://localhost:8000'
const USER_ID = 'b1f3bd4d-a402-4311-b876-3720892d198c'

export default function Upload() {
  const router = useRouter()
  const [tab, setTab] = useState('pdf')
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const uploadPDF = async () => {
    if (!file || !title) return setMessage('Please select a file and enter a title')
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('user_id', USER_ID)

    try {
      const res = await fetch(`${API}/documents/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setMessage(`✅ Uploaded! Doc ID: ${data.doc_id}`)
      setTimeout(() => router.push('/chat'), 2000)
    } catch (err) {
      setMessage('❌ Upload failed. Make sure backend is running.')
    }
    setLoading(false)
  }

  const ingestURL = async () => {
    if (!url || !title) return setMessage('Please enter a URL and title')
    setLoading(true)
    const formData = new FormData()
    formData.append('url', url)
    formData.append('title', title)
    formData.append('user_id', USER_ID)

    try {
      const res = await fetch(`${API}/documents/url`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setMessage(`✅ Ingested! Doc ID: ${data.doc_id}`)
      setTimeout(() => router.push('/chat'), 2000)
    } catch (err) {
      setMessage('❌ Ingestion failed. Make sure backend is running.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f1117'
    }}>
      <div style={{
        background: '#1a1f2e',
        border: '1px solid #2d3748',
        borderRadius: '12px',
        padding: '40px',
        width: '480px'
      }}>
        <h2 style={{ color: '#00d4ff', marginBottom: '24px', fontSize: '24px' }}>
          Upload Document
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['pdf', 'url'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              background: tab === t ? '#00d4ff' : '#2d3748',
              color: tab === t ? '#0f1117' : '#e2e8f0'
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Title input */}
        <input
          placeholder="Document title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #2d3748',
            background: '#0f1117',
            color: '#e2e8f0',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        />

        {/* PDF or URL input */}
        {tab === 'pdf' ? (
          <input
            type="file"
            accept=".pdf"
            onChange={e => setFile(e.target.files[0])}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2d3748',
              background: '#0f1117',
              color: '#e2e8f0',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          />
        ) : (
          <input
            placeholder="https://example.com/article"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #2d3748',
              background: '#0f1117',
              color: '#e2e8f0',
              marginBottom: '16px',
              fontSize: '14px'
            }}
          />
        )}

        {/* Submit button */}
        <button
          onClick={tab === 'pdf' ? uploadPDF : ingestURL}
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#2d3748' : '#00d4ff',
            color: '#0f1117',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : tab === 'pdf' ? 'Upload PDF' : 'Ingest URL'}
        </button>

        {/* Message */}
        {message && (
          <p style={{
            marginTop: '16px',
            color: message.includes('✅') ? '#10b981' : '#f87171',
            fontSize: '14px'
          }}>
            {message}
          </p>
        )}

        {/* Back link */}
        <a href="/" style={{
          display: 'block',
          textAlign: 'center',
          marginTop: '20px',
          color: '#64748b',
          fontSize: '14px',
          textDecoration: 'none'
        }}>
          ← Back to home
        </a>
      </div>
    </div>
  )
}