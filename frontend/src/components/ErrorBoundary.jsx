import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: 'white',
          flexDirection: 'column',
          gap: '20px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>Something went wrong</h1>
          <p style={{ margin: '0 0 20px', color: '#94a3b8', maxWidth: '500px' }}>
            An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
          </p>
          <details style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '6px', maxWidth: '600px', fontSize: '0.9rem', color: '#cbd5e1' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>Error Details</summary>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8rem' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.background = '#2563eb'}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
