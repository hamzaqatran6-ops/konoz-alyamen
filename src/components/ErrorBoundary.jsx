import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Error Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center" dir="rtl">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4">عذراً، حدث خطأ غير متوقع</h1>
          <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
            تسبب خلل تقني بسيط في توقف الواجهة. لا تقلق، بياناتك في أمان. الضغط على الزر أدناه قد يحل المشكلة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:scale-105 transition-transform"
            >
              تحديث الصفحة 🔄
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-8 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
          
          {process.env.NODE_ENV === "development" && (
            <div className="mt-12 p-4 bg-red-50 border border-red-100 rounded-xl text-left font-mono text-[10px] text-red-700 max-w-2xl overflow-auto hidden md:block">
              {this.state.error?.toString()}
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
