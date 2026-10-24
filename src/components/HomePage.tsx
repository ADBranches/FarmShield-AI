import React from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, ArrowRight, PhoneCall, Zap, Leaf } from 'lucide-react';

interface HomePageProps {
  onStartAssessment: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStartAssessment }) => {
  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#1b4332] via-[#21513c] to-[#2d6a4f] text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Leaf className="w-64 h-64 text-emerald-200" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-medium text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Built for Uganda Smallholder Farmers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
            Early Farm Risk Screening for Your Crops & Livestock
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Spot climate, pest, and disease threats before they ruin your harvest or herd. Get instant risk scores and three practical, low-cost actions using materials available in your village.
          </p>

          <div className="pt-2">
            <button
              onClick={onStartAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-[#1b2f1e] font-bold text-base px-6 py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <span>Assess Farm Risk</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[12px] text-emerald-300/80 mt-2 text-center sm:text-left">
              Takes less than 2 minutes • Low data usage • Works offline-ready
            </p>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">Instant Risk Score</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Screen threat severity from Low to Critical based on local weather & symptoms.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">3 Low-Cost Actions</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Practical remedies using local ash, neem, soil trenches, and isolation.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-stone-900 text-sm">SMS Alert Ready</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Copy a concise 160-character summary to send via SMS or WhatsApp.
            </p>
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="bg-stone-100/90 border border-stone-200 rounded-xl p-4 text-xs text-stone-600 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-stone-800">Agricultural Screening Advisory:</strong> FarmerShield AI provides early decision support based on symptoms and rainfall. It is not a confirmed laboratory diagnosis. In severe cases, our system alerts you to consult your Sub-county Agricultural Officer or Veterinary Officer.
        </p>
      </div>
    </div>
  );
};
