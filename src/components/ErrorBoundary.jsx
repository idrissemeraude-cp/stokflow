import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('stockflow_current_view');
      localStorage.removeItem('stockflow_active_tab');
      localStorage.removeItem('stockflow_user');
    } catch (_) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#064E3B] text-white flex items-center justify-center p-6 font-sans">
          <div className="bg-white text-[#064E3B] w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-emerald-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            
            <h1 className="text-xl font-extrabold text-gray-900 mb-2">
              StockFlow Pro
            </h1>
            
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Un problème d'affichage local a été détecté. Vos données Supabase restent sécurisées.
            </p>

            {this.state.error?.message && (
              <p className="text-[11px] text-red-600 font-mono bg-red-50 p-2 rounded-xl mb-4 text-left overflow-x-auto">
                Erreur: {this.state.error.message}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-emerald-300 transition-all"
              >
                <Home className="w-4 h-4 text-emerald-700" />
                <span>Réinitialiser & Ouvrir</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
