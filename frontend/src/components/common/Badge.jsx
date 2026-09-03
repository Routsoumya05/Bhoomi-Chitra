import React from 'react';

export default function Badge({ status, size = 'sm' }) {
  if (!status) return null;

  const normalized = String(status).toUpperCase().replace(/\s+/g, '_');

  const statusConfig = {
    // Land parcel & project statuses
    'PROPOSED': { label: 'PROPOSED', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    'NOTIFICATION_ISSUED': { label: 'NOTIFICATION ISSUED', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'AWARD_DECLARED': { label: 'AWARD DECLARED', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'COMPENSATION_PENDING': { label: 'COMPENSATION PENDING', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    'COMPENSATION_PAID': { label: 'COMPENSATION PAID', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    'POSSESSION_COMPLETED': { label: 'POSSESSION COMPLETED', bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-400' },
    'DISPUTED': { label: 'DISPUTED', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },

    // Project workflow states
    'DRAFT': { label: 'DRAFT', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    'SUBMITTED': { label: 'SUBMITTED', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
    'UNDER_SCRUTINY': { label: 'UNDER SCRUTINY', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    'STATE_VERIFICATION': { label: 'STATE VERIFICATION', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
    'CENTRAL_APPROVAL': { label: 'CENTRAL APPROVAL', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'NOTIFICATION': { label: 'NOTIFICATION', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'ACQUISITION_IN_PROGRESS': { label: 'ACQUISITION IN PROGRESS', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-300' },
    'AWARD_STAGE': { label: 'AWARD STAGE', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'COMPENSATION_STAGE': { label: 'COMPENSATION STAGE', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    'POSSESSION_STAGE': { label: 'POSSESSION STAGE', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-300' },
    'RR_STAGE': { label: 'R&R STAGE', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
    'COMPLETED': { label: 'COMPLETED', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    'ON_HOLD': { label: 'ON HOLD', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },

    // Risk levels
    'LOW': { label: 'LOW RISK', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    'MEDIUM': { label: 'MEDIUM RISK', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    'HIGH': { label: 'HIGH RISK', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },

    // Milestones
    'ON_TIME': { label: 'ON TIME', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    'AT_RISK': { label: 'AT RISK', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    'DELAYED': { label: 'DELAYED', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },

    // Verification
    'VERIFIED': { label: 'VERIFIED', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
    'PENDING': { label: 'PENDING', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },

    // Land Types & Statutory Classifications
    'GOVT_REVENUE': { label: 'GOVT. LAND (REVENUE)', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400' },
    'GOVT_LAND': { label: 'GOVT. LAND', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-400' },
    'STATE_STATUTORY': { label: 'STATE STATUTORY / PSU', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
    'GRAM_SABHA': { label: 'GRAM SABHA / PANCHAYAT', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-300' },
    'FOREST_LAND': { label: 'FOREST DEPT / RESERVE', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    'CENTRAL_GOVT': { label: 'CENTRAL / DEFENCE', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    'WATER_BODY': { label: 'WATER BODY / CATCHMENT', bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300' },
    'PRIVATE_AGRICULTURAL': { label: 'PRIVATE AGRICULTURAL', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
    'PRIVATE_COMMERCIAL': { label: 'PRIVATE COMMERCIAL', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    'PRIVATE_RESIDENTIAL': { label: 'PRIVATE RESIDENTIAL', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
    'AGRICULTURAL': { label: 'AGRICULTURAL', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
    'COMMERCIAL': { label: 'COMMERCIAL', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
    'RESIDENTIAL': { label: 'RESIDENTIAL', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-300' },
    'FOREST': { label: 'FOREST', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
    'BARREN': { label: 'BARREN / WASTELAND', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' }
  };

  const conf = statusConfig[normalized] || {
    label: status.replace(/_/g, ' '),
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300'
  };

  const sizeClasses = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5'
    : (size === 'lg' ? 'text-sm px-3 py-1 font-bold' : 'text-xs px-2 py-0.5 font-semibold');

  return (
    <span className={`inline-flex items-center rounded-md border tracking-wide uppercase ${sizeClasses} ${conf.bg} ${conf.text} ${conf.border}`}>
      {conf.label}
    </span>
  );
}
