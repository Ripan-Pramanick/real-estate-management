import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 font-sans text-zinc-300">
          <div className="bg-[#111114] border border-red-900/50 p-8 rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <ShieldAlert className="w-8 h-8" />
              <h1 className="text-xl font-bold uppercase tracking-wider">Application Crashed</h1>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6">
              A rendering error occurred. Please check the data types coming from Supabase.
            </p>

            <div className="bg-[#09090b] border border-zinc-800 rounded p-4 overflow-auto mb-4">
              <h3 className="text-red-400 font-bold mb-2 text-sm">{this.state.error?.toString()}</h3>
              <pre className="text-[10px] text-zinc-500 font-mono leading-relaxed">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>

            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}