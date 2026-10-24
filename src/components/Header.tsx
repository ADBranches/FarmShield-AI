import React from 'react';
import { ShieldCheck, Sprout } from 'lucide-react';

interface HeaderProps {
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onGoHome }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#163a24] text-white shadow-md border-b border-[#235334]">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center space-x-2.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded-lg p-1 -m-1"
          aria-label="FarmerShield AI Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-inner border border-emerald-400/30">
            <ShieldCheck className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg tracking-tight text-white">FarmerShield</span>
              <span className="bg-emerald-400/20 text-emerald-300 text-[11px] font-semibold px-1.5 py-0.5 rounded border border-emerald-400/30">AI</span>
            </div>
            <p className="text-xs text-emerald-200/80 font-medium flex items-center gap-1">
              <Sprout className="w-3 h-3 text-emerald-400 inline" />
              Uganda Agricultural Risk Screening
            </p>
          </div>
        </button>

        <div className="flex items-center space-x-2 text-xs font-medium text-emerald-200/90 bg-[#112d1c] px-2.5 py-1.5 rounded-full border border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online</span>
        </div>
      </div>
    </header>
  );
};
