import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * MyAssetsErrorBoundary — catches import or render exceptions from the
 * lazy-loaded My Assets view so the user sees a clear message instead of a
 * blank screen.
 *
 * Shows:
 *  - "My Assets couldn't load"
 *  - the actual development error (message + stack preview)
 *  - Retry (remounts the lazy tree) and Return Home actions
 */
export default class MyAssetsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Temporary development logging — helps diagnose lazy import / render failures.
    console.error('[MyAssetsErrorBoundary] render/import failure:', error, info);
    this.setState({ info });
  }

  handleRetry = () => {
    // Resetting state forces a clean remount of the lazy tree — the parent
    // Suspense re-attempts the dynamic import and React Query refetches on mount.
    this.setState({ hasError: false, error: null, info: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { isDark } = this.props;
    const err = this.state.error;
    const msg = err?.message || String(err);
    const stack = err?.stack || this.state.info?.componentStack || '';

    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)' }}>
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className={`text-base font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          My Assets couldn’t load
        </h2>
        <p className={`text-xs mb-4 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
          Something went wrong while loading this section.
        </p>

        {/* Development error detail */}
        <div className={`w-full max-w-md text-left rounded-xl p-3 mb-5 overflow-auto max-h-48 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
          <p className={`text-[11px] font-mono break-words ${isDark ? 'text-red-300' : 'text-red-600'}`}>{msg}</p>
          {stack && (
            <pre className={`mt-2 text-[10px] font-mono whitespace-pre-wrap break-words ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
              {String(stack).slice(0, 800)}
            </pre>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: '#f97316' }}>
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
          <Link to="/bingoo?view=hub"
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border ${isDark ? 'border-white/10 text-white/70' : 'border-slate-200 text-slate-600'}`}>
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    );
  }
}