import React, { useState, useEffect } from 'react';
import { ROTATING_TIPS } from '../data/ugandaAgriData';
import { Sprout, Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  district: string;
  itemType: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ district, itemType }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm text-center space-y-6">
      <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
        {/* Animated outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
          <Sprout className="w-7 h-7 animate-bounce" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-stone-900">
          Analyzing Farm Risk for {itemType}
        </h2>
        <p className="text-sm text-stone-600">
          Evaluating symptoms against climate, rainfall, and threat patterns in {district} District...
        </p>
      </div>

      <div className="max-w-md mx-auto p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-left space-y-1.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Farming Knowledge Tip:</span>
        </div>
        <p className="text-xs text-emerald-900/90 leading-relaxed transition-all">
          {ROTATING_TIPS[tipIndex]}
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 text-xs text-stone-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Optimizing practical actions for smallholder farmers...</span>
      </div>
    </div>
  );
};
