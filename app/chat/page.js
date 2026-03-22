'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const API = 'https://Kaushikdeveloper-docmind-rag-backend.hf.space'
const USER_ID = 'b1f3bd4d-a402-4311-b876-3720892d198c'

export default function Chat() {
  const [documents, setDocuments] = useState([])
  const [selectedDocs, setSelectedDocs] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [blogLoading, setBlogLoading] = useState(false)
  const [blog, setBlog] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API}/documents/?user_id=${USER_ID}`)
      const data = await res.json()
      setDocuments(data.filter(d => d.status === 'ready'))
    } catch {
      console.error('Could not fetch documents')
    }
  }

  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    if (selectedDocs.length === 0) return alert('Please select at least one document first')

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: USER_ID,
          doc_ids: selectedDocs,
          query: input
        })
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        cited_pages: data.cited_pages,
        response_ms: data.response_ms
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Error connecting to backend. Make sure server is running on port 8000.'
      }])
    }
    setLoading(false)
  }

  const generateBlog = async () => {
    if (!sessionId) return alert('Start a conversation first')
    setBlogLoading(true)
    try {
      const res = await fetch(`${API}/chat/blog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, user_id: USER_ID })
      })
      const data = await res.json()
      setBlog(data)
    } catch {
      alert('Blog generation failed')
    }
    setBlogLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #080c14; color: #e2e8f0; height: 100vh; overflow: hidden; }

        .app { display: flex; height: 100vh; overflow: hidden; }

        /* SIDEBAR */
        .sidebar {
          width: ${sidebarOpen ? '260px' : '0px'};
          min-width: ${sidebarOpen ? '260px' : '0px'};
          background: #0d1220;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          white-space: nowrap;
        }
        .logo span { color: #00d4ff; }

        .sidebar-section {
          padding: 16px;
          flex: 1;
          overflow-y: auto;
        }

        .sidebar-label {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 10px;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 4px;
          border: 1px solid transparent;
        }

        .doc-item:hover { background: rgba(255,255,255,0.04); }

        .doc-item-selected {
          background: rgba(0,212,255,0.08) !important;
          border-color: rgba(0,212,255,0.2);
        }

        .doc-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1.5px solid #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }

        .doc-checkbox-checked {
          background: #00d4ff;
          border-color: #00d4ff;
        }

        .doc-name {
          font-size: 13px;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .doc-name-selected { color: #e2e8f0; }

        .doc-badge {
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(16,185,129,0.1);
          color: #10b981;
          margin-left: auto;
          flex-shrink: 0;
        }

        .upload-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #475569;
          text-decoration: none;
          font-size: 13px;
          transition: all 0.15s;
          border: 1px dashed rgba(255,255,255,0.08);
          margin-top: 8px;
        }

        .upload-link:hover { color: #00d4ff; border-color: rgba(0,212,255,0.2); }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .blog-btn {
          width: 100%;
          padding: 10px;
          background: rgba(124,58,237,0.1);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 8px;
          color: #a78bfa;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .blog-btn:hover:not(:disabled) {
          background: rgba(124,58,237,0.15);
          transform: translateY(-1px);
        }

        .blog-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* MAIN CHAT */
        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .topbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #080c14;
        }

        .toggle-btn {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .toggle-btn:hover { color: #e2e8f0; border-color: rgba(255,255,255,0.15); }

        .topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        .selected-count {
          font-size: 12px;
          padding: 3px 10px;
          background: rgba(0,212,255,0.08);
          color: #00d4ff;
          border-radius: 100px;
          border: 1px solid rgba(0,212,255,0.15);
        }

        /* MESSAGES */
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #475569;
          text-align: center;
        }

        .empty-icon { font-size: 40px; margin-bottom: 8px; }
        .empty-title { font-family: 'Syne', sans-serif; font-size: 18px; color: #64748b; }
        .empty-sub { font-size: 14px; max-width: 320px; line-height: 1.6; }

        .message { display: flex; gap: 14px; max-width: 800px; }
        .message-user { flex-direction: row-reverse; align-self: flex-end; }
        .message-assistant { align-self: flex-start; }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .avatar-user { background: rgba(0,212,255,0.15); }
        .avatar-assistant { background: rgba(124,58,237,0.15); }

        .bubble {
          padding: 14px 18px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.7;
          max-width: 640px;
        }

        .bubble-user {
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.15);
          color: #e2e8f0;
          border-bottom-right-radius: 4px;
        }

        .bubble-assistant {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          color: #cbd5e1;
          border-bottom-left-radius: 4px;
        }

        .citations {
          margin-top: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .citation {
          font-size: 11px;
          padding: 3px 8px;
          background: rgba(245,158,11,0.08);
          border: 1px solid rgba(245,158,11,0.15);
          color: #f59e0b;
          border-radius: 4px;
          font-family: 'DM Mono', monospace;
        }

        .response-time {
          font-size: 11px;
          color: #475569;
          margin-top: 8px;
          font-family: 'DM Mono', monospace;
        }

        .typing {
          display: flex;
          gap: 4px;
          padding: 4px 0;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d4ff;
          animation: bounce 1.2s infinite;
        }

        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }

        /* INPUT */
        .input-area {
          padding: 16px 24px 24px;
          background: #080c14;
        }

        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          transition: border-color 0.2s;
        }

        .input-box:focus-within { border-color: rgba(0,212,255,0.3); }

        .input-textarea {
          flex: 1;
          background: transparent;
          border: none;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          resize: none;
          outline: none;
          max-height: 120px;
          min-height: 24px;
          line-height: 1.6;
        }

        .input-textarea::placeholder { color: #475569; }

        .send-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #00d4ff;
          color: #080c14;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: #00bfe8;
          transform: translateY(-1px);
        }

        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .input-hint {
          font-size: 12px;
          color: #334155;
          text-align: center;
          margin-top: 10px;
        }

        /* BLOG MODAL */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
        }

        .modal {
          background: #0d1220;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          width: 100%;
          max-width: 720px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .modal-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #64748b;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close:hover { color: #e2e8f0; }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .blog-content {
          font-size: 14px;
          line-height: 1.8;
          color: #94a3b8;
          white-space: pre-wrap;
          font-family: 'DM Mono', monospace;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          gap: 10px;
        }

        .copy-btn {
          padding: 10px 20px;
          background: rgba(0,212,255,0.1);
          border: 1px solid rgba(0,212,255,0.2);
          color: #00d4ff;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
        }

        .copy-btn:hover { background: rgba(0,212,255,0.15); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>

      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="logo">Doc<span>Mind</span></Link>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Documents</div>

          {documents.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
              No documents yet. Upload one to get started.
            </p>
          ) : (
            documents.map(doc => (
                <div
                key={doc.id}
                className={`doc-item ${selectedDocs.includes(doc.id) ? 'doc-item-selected' : ''}`}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
                  onClick={() => toggleDoc(doc.id)}
                >
                  <div className={`doc-checkbox ${selectedDocs.includes(doc.id) ? 'doc-checkbox-checked' : ''}`}>
                    {selectedDocs.includes(doc.id) && <span style={{ color: '#080c14', fontSize: '10px', fontWeight: '700' }}>✓</span>}
                  </div>
                  <span className={`doc-name ${selectedDocs.includes(doc.id) ? 'doc-name-selected' : ''}`}>
                    {doc.title}
                  </span>
                  <span className="doc-badge">{doc.type}</span>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation()
                    if (!confirm('Delete this document?')) return
                    await fetch(`${API}/documents/${doc.id}`, { method: 'DELETE' })
                    fetchDocuments()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#475569',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s',
                    flexShrink: 0
                  }}
                  onMouseOver={e => e.target.style.color = '#f87171'}
                  onMouseOut={e => e.target.style.color = '#475569'}
                >
                  🗑
                </button>
              </div>
            ))
          )}

          <Link href="/upload" className="upload-link">
            + Upload new document
          </Link>
        </div>

        <div className="sidebar-footer">
          <button className="blog-btn" onClick={generateBlog} disabled={!sessionId || blogLoading}>
            {blogLoading ? '⏳ Generating...' : '✍️ Generate Blog Post'}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <button className="toggle-btn" onClick={() => setSidebarOpen(p => !p)}>☰</button>
          <span className="topbar-title">Chat</span>
          {selectedDocs.length > 0 && (
            <span className="selected-count">{selectedDocs.length} doc{selectedDocs.length > 1 ? 's' : ''} selected</span>
          )}
        </div>

        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">Start a conversation</div>
              <div className="empty-sub">
                Select documents from the sidebar, then ask anything about them.
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message message-${msg.role}`}>
                <div className={`avatar avatar-${msg.role}`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div>
                  <div className={`bubble bubble-${msg.role}`}>
                    {msg.content}
                    {msg.cited_pages && msg.cited_pages.length > 0 && (
                      <div className="citations">
                        {msg.cited_pages.map((p, j) => (
                          <span key={j} className="citation">
                            Page {p.page_no} · {p.score}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.response_ms && (
                    <div className="response-time">{msg.response_ms}ms</div>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message message-assistant">
              <div className="avatar avatar-assistant">🤖</div>
              <div className="bubble bubble-assistant">
                <div className="typing">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="input-area">
          <div className="input-box">
            <textarea
              className="input-textarea"
              placeholder="Ask anything about your documents..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={sendMessage} disabled={loading || !input.trim()}>
              ↑
            </button>
          </div>
          <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
        </div>
      </div>

      {/* BLOG MODAL */}
      {blog && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setBlog(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">📝 {blog.title}</div>
              <button className="modal-close" onClick={() => setBlog(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="blog-content">{blog.content_md}</div>
            </div>
            <div className="modal-footer">
              <button className="copy-btn" onClick={() => {
                navigator.clipboard.writeText(blog.content_md)
                alert('Copied to clipboard!')
              }}>
                Copy Markdown
              </button>
              <button className="copy-btn" onClick={() => setBlog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}