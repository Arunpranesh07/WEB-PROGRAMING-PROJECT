import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
    window.__lastError = error;
    window.__lastErrorInfo = errorInfo;
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-200 p-8 shadow-lg space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Application Error Caught</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              A runtime issue occurred while rendering this view:
            </p>
            <div className="bg-slate-900 text-rose-300 p-3.5 rounded-xl font-mono text-xs overflow-auto max-h-48 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </div>
            {this.state.errorInfo?.componentStack && (
              <details className="text-[11px] text-slate-500 font-mono">
                <summary className="cursor-pointer hover:text-slate-800">View component stack trace</summary>
                <pre className="mt-2 p-2 bg-slate-100 rounded text-[10px] overflow-auto max-h-36">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-ocean-600 hover:bg-ocean-700 text-white font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
