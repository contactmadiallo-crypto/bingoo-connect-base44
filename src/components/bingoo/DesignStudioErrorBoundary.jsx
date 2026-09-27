import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class DesignStudioErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[DesignStudio] render error', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[360px] rounded-2xl border border-amber-200 bg-white p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <h2 className="font-black text-[#0b2149]">Design Studio could not finish loading</h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md">Your design data is safe. Reload the Studio and continue from the current workspace.</p>
        <button type="button" onClick={() => this.setState({ error: null })} className="mt-4 min-h-[44px] px-4 rounded-xl bg-[#0b2149] text-white text-sm font-bold flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Reload Studio
        </button>
      </div>
    );
  }
}
