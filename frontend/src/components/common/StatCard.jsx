import React from 'react';

export default function StatCard({ title, value, unit = '', subtitle, icon: Icon, color = 'blue', trend, onClick }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', iconBg: 'bg-blue-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', iconBg: 'bg-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-amber-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-purple-600' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100', iconBg: 'bg-rose-600' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', iconBg: 'bg-slate-700' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-500">{title}</p>
          <div className="flex items-baseline space-x-1.5 mt-1.5">
            <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
            {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
          </div>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${scheme.iconBg} shadow-sm shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-500">
          <span>{trend.label}</span>
          <span className={`font-semibold ${trend.positive ? 'text-emerald-600' : 'text-slate-600'}`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
