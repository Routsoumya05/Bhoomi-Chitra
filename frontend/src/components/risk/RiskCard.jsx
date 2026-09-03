import React from 'react';
import Badge from '../common/Badge';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function RiskCard({ riskData }) {
  if (!riskData) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
        Computing transparent acquisition risk indicators...
      </div>
    );
  }

  const { score = 0, riskLevel = 'LOW', contributingFactors = [], recommendedActions = [] } = riskData;

  const getScoreColor = () => {
    if (score >= 61) return { text: 'text-rose-600', stroke: '#dc2626', bg: 'bg-rose-50', border: 'border-rose-200' };
    if (score >= 31) return { text: 'text-amber-600', stroke: '#d97706', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { text: 'text-emerald-600', stroke: '#059669', bg: 'bg-emerald-50', border: 'border-emerald-200' };
  };

  const scheme = getScoreColor();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base tracking-tight flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Statutory Land Acquisition Risk Intelligence</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Transparent Rule-Based Predictive Analytics (0 – 100 Index)
          </p>
        </div>
        <Badge status={riskLevel} size="md" />
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Gauge & Overall Score */}
        <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-xl border border-slate-200 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke={scheme.stroke}
                strokeWidth="10"
                strokeDasharray={`${(score / 100) * 251.2} 251.2`}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-extrabold ${scheme.text}`}>{score}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">out of 100</span>
            </div>
          </div>

          <div className="mt-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${scheme.bg} ${scheme.text} ${scheme.border}`}>
              {riskLevel} RISK INDEX
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
            Evaluates corridor litigation, compensation backlog, milestone slippage, and R&R colony readiness.
          </p>
        </div>

        {/* Center Column: Contributing Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-slate-600" />
            <span>Primary Contributing Factors</span>
          </h4>

          {contributingFactors.length === 0 ? (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
              No critical bottleneck or dispute factors currently identified.
            </div>
          ) : (
            <div className="space-y-2">
              {contributingFactors.map((cf, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{cf.factor}</span>
                    <span className="text-[10px] font-bold text-rose-600 px-1.5 py-0.5 bg-rose-50 border border-rose-200 rounded">
                      {cf.impact || cf.weight}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-snug">{cf.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Actionable Recommendations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <span>Recommended Mitigation Actions</span>
          </h4>

          {recommendedActions.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
              Project progressing within acceptable statutory tolerance parameters.
            </div>
          ) : (
            <div className="space-y-2">
              {recommendedActions.map((ra, idx) => (
                <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                      {ra.dept || 'Mitigation'}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ra.urgency === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ra.urgency || 'HIGH'}
                    </span>
                  </div>
                  <p className="text-slate-800 font-semibold text-[11px] leading-snug">{ra.action}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
