import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Global error boundary to prevent blank page in Safari
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexDirection: 'column', gap: '16px',
          background: '#FDF6EC', fontFamily: 'Inter, sans-serif', padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px' }}>🍛</div>
          <h1 style={{ color: '#C0272D', fontFamily: 'Georgia, serif', fontSize: '28px' }}>
            Hotel Aaichyaa Gavat
          </h1>
          <p style={{ color: '#8B1A1A', fontWeight: 600 }}>Something went wrong loading the page</p>
          <pre style={{
            background: '#fff', border: '1px solid #e0d0c0', borderRadius: '8px',
            padding: '16px', fontSize: '12px', color: '#555', maxWidth: '600px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', textAlign: 'left'
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#C0272D', color: 'white', border: 'none',
              padding: '12px 28px', borderRadius: '6px', fontSize: '15px',
              fontWeight: 600, cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
)
