import React from 'react';
import { RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetDataAndReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('amour_affinites_convs');
      localStorage.removeItem('amour_affinites_messages');
      localStorage.removeItem('amour_affinites_privacy');
      localStorage.removeItem('amour_affinites_ai');
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-orange-50 flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-200 text-center space-y-5">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900">
                Une petite interruption est survenue
              </h2>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                L'application a rencontré une exception temporaire. Vous pouvez actualiser la page ou réinitialiser les données en cache.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-left overflow-auto max-h-28 text-[11px] font-mono text-rose-800">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger l'application</span>
              </button>

              <button
                onClick={this.handleResetDataAndReload}
                className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Nettoyer le cache et relancer</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
