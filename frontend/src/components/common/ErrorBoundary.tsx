import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center">
            <div className="inline-flex p-4 bg-rose-50 text-rose-600 rounded-full mb-5">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-slate-600 text-sm mb-6">
              An unexpected error occurred in the application. Please try reloading or returning to the dashboard.
            </p>
            
            {this.state.error && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left max-h-36 overflow-y-auto">
                <p className="text-xs font-mono text-rose-600 break-words font-semibold">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200 shadow-md shadow-blue-500/10 cursor-pointer w-full text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
