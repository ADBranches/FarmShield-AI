import React, { useState } from 'react';
import { RiskAssessmentResult, FarmAssessmentFormData } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  PhoneCall,
  MessageSquare,
  Wrench,
  Info
} from 'lucide-react';

interface ResultDisplayProps {
  result: RiskAssessmentResult;
  formData: FarmAssessmentFormData;
  onNewAssessment: () => void;
  onEditAssessment: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  formData,
  onNewAssessment,
  onEditAssessment,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySms = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.sms_alert_summary);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = result.sms_alert_summary;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy SMS:', err);
    }
  };

  // Color config according to risk level
  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'Critical':
        return {
          badgeBg: 'bg-red-100 text-red-900 border-red-300',
          barColor: 'bg-red-600',
          textColor: 'text-red-700',
          bannerBg: 'bg-red-50 border-red-200',
          icon: ShieldAlert,
        };
      case 'High':
        return {
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-300',
          barColor: 'bg-orange-500',
          textColor: 'text-orange-700',
          bannerBg: 'bg-orange-50 border-orange-200',
          icon: AlertTriangle,
        };
      case 'Medium':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          barColor: 'bg-amber-500',
          textColor: 'text-amber-700',
          bannerBg: 'bg-amber-50 border-amber-200',
          icon: AlertTriangle,
        };
      case 'Low':
      default:
        return {
          badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          barColor: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          bannerBg: 'bg-emerald-50 border-emerald-200',
          icon: ShieldCheck,
        };
    }
  };

  const riskStyle = getRiskStyle(result.risk_level);
  const RiskIcon = riskStyle.icon;

  return (
    <div className="space-y-6">
      {/* Top Meta info */}
      <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
        <span>
          Location: <strong className="text-stone-800">{formData.district} District</strong>
        </span>
        <span>
          Target: <strong className="text-stone-800">{formData.itemType}</strong>
        </span>
      </div>

      {/* Main Risk Score Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Risk Screening Result
            </span>
            <div className="flex items-center space-x-3 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 ${riskStyle.badgeBg}`}>
                <RiskIcon className="w-3.5 h-3.5" />
                {result.risk_level} Risk
              </span>
              <span className="text-stone-400 text-xs">•</span>
              <span className="text-xs text-stone-600 font-medium">
                Score: <strong className="text-base text-stone-900">{result.risk_score}</strong> / 100
              </span>
            </div>
          </div>

          {/* Visual Score Gauge Bar */}
          <div className="w-full sm:w-48 bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
            <div
              className={`h-full transition-all duration-700 ${riskStyle.barColor}`}
              style={{ width: `${result.risk_score}%` }}
            ></div>
          </div>
        </div>

        {/* Primary Threat Banner */}
        <div className={`p-4 rounded-xl border ${riskStyle.bannerBg} space-y-1`}>
          <div className="flex items-center space-x-2">
            <ShieldAlert className={`w-4 h-4 ${riskStyle.textColor}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Primary Threat Identified
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-stone-900 leading-snug">
            {result.primary_threat}
          </p>
        </div>

        {/* Assessment Summary */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wide flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-stone-500" />
            Assessment Summary
          </h3>
          <p className="text-sm text-stone-800 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
            {result.assessment_summary}
          </p>
        </div>
      </div>

      {/* Immediate Actions (Three low-cost steps) */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
            3 Practical Immediate Actions (Low-Cost / Local)
          </h3>
        </div>

        <div className="space-y-3">
          {result.immediate_actions.map((action, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-100"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {index + 1}
              </div>
              <p className="text-sm text-stone-800 leading-relaxed pt-0.5 font-medium">
                {action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Extension Officer Review Status */}
      <div
        className={`rounded-2xl border p-5 shadow-sm ${
          result.requires_officer_review
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-emerald-50/70 border-emerald-200'
        }`}
      >
        <div className="flex items-start space-x-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              result.requires_officer_review
                ? 'bg-amber-200/80 text-amber-900'
                : 'bg-emerald-200/80 text-emerald-900'
            }`}
          >
            <PhoneCall className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-stone-900">
              {result.requires_officer_review
                ? 'Agricultural / Veterinary Officer Review Recommended'
                : 'Standard Farm-Level Monitoring Recommended'}
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              {result.requires_officer_review
                ? `Due to severity, symptoms or climate vulnerability, please contact your Sub-county Agricultural Officer or District Veterinary Officer in ${formData.district} for physical verification.`
                : 'Current threat can be monitored and managed locally using the 3 steps above. Inspect every 48 hours for any escalation.'}
            </p>
          </div>
        </div>
      </div>

      {/* SMS Alert Summary Card with Copy Button */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 shadow-sm space-y-3 border border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <MessageSquare className="w-4 h-4" />
            <span>SMS Alert Summary (Standard 160-char text)</span>
          </div>
          <span className="text-[11px] text-stone-400">
            {result.sms_alert_summary.length} / 160 chars
          </span>
        </div>

        <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 font-mono text-xs text-emerald-200 leading-relaxed select-all">
          {result.sms_alert_summary}
        </div>

        <button
          type="button"
          onClick={handleCopySms}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-stone-800 hover:bg-stone-700 text-white border border-stone-700'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy SMS for Feature Phone / WhatsApp</span>
            </>
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onNewAssessment}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>New Assessment</span>
        </button>

        <button
          type="button"
          onClick={onEditAssessment}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-stone-50 active:bg-stone-100 text-stone-800 font-semibold text-sm border border-stone-300 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-stone-500" />
          <span>Edit Symptoms / Add Photo</span>
        </button>
      </div>

      {/* Medical/Diagnostic Disclaimer */}
      <p className="text-[11px] text-stone-500 text-center leading-relaxed">
        FarmerShield AI is an advisory risk-screening tool and does not replace certified laboratory diagnosis. Always follow Uganda Ministry of Agriculture, Animal Industry and Fisheries (MAAIF) chemical safety guidelines.
      </p>
    </div>
  );
};
