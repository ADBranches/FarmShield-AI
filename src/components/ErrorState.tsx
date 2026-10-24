import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  errorMessage: string;
  isNetworkError?: boolean;
  onRetry: () => void;
  onBackToEdit: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  errorMessage,
  isNetworkError = false,
  onRetry,
  onBackToEdit,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-red-200 p-6 sm:p-8 shadow-sm text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
        {isNetworkError ? <WifiOff className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">
          {isNetworkError ? 'Network Connection Issue' : 'Assessment Could Not Complete'}
        </h2>
        <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
          {errorMessage || 'We could not evaluate your farm details at this moment. Please check your internet connection or try again.'}
        </p>
      </div>

      <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-600 max-w-md mx-auto text-left">
        <strong className="block text-stone-800 font-semibold mb-1">Suggestions for rural connections:</strong>
        <ul className="list-disc pl-4 space-y-1">
          <li>Check that mobile data or Wi-Fi is active.</li>
          <li>If you uploaded a very large photo, try submitting with a smaller picture or text-only symptoms.</li>
          <li>Confirm all required fields are filled.</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
        <button
          type="button"
          onClick={onRetry}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Assessment</span>
        </button>

        <button
          type="button"
          onClick={onBackToEdit}
          className="w-full py-3.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm border border-stone-300 transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Review Farm Info</span>
        </button>
      </div>
    </div>
  );
};
