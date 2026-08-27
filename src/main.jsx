import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("StockFlow App Uncaught Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'Inter, sans-serif',
          backgroundColor: '#F0FDF4',
          color: '#064E3B',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            maxWidth: '500px',
            border: '1px solid #A7F3D0'
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px' }}>
              StockFlow Pro — Rechargement
            </h2>
            <p style={{ fontSize: '14px', color: '#047857', marginBottom: '20px', lineHeight: '1.5' }}>
              Le site a été mis à jour avec succès. Cliquez ci-dessous pour charger la dernière version de votre boutique.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Recharger la page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  border: '1px solid #A7F3D0',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Vider le cache local
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
