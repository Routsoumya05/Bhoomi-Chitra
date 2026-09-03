import React from 'react';
import { Shield, MapPin, CheckCircle2, Award, FileCheck2, Users, Network } from 'lucide-react';

export default function PublicAbout() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0f2942] text-amber-400 p-2 flex items-center justify-center mx-auto mb-4 shadow-md border border-amber-500/40">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke="#f59e0b" strokeWidth="6" />
            <path d="M50 22 L75 36 L75 64 L50 78 L25 64 L25 36 Z" fill="#15803d" opacity="0.85" />
            <line x1="50" y1="22" x2="50" y2="78" stroke="#ffffff" strokeWidth="3" />
            <line x1="25" y1="50" x2="75" y2="50" stroke="#ffffff" strokeWidth="3" />
            <circle cx="50" cy="50" r="8" fill="#f59e0b" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-[#0f2942] tracking-tight">BHOOMI CHITRA</h1>
        <h2 className="text-base font-bold text-amber-600 mt-1">National Land Acquisition & Management System</h2>
        <p className="text-sm font-semibold text-slate-700 mt-2 max-w-xl mx-auto">
          "Transparent Land Acquisition. Connected Governance. Smarter Decisions."
        </p>
        <p className="text-xs text-slate-500 mt-3 max-w-2xl mx-auto leading-relaxed">
          BHOOMI CHITRA is a GIS-enabled national platform initiated to eliminate project bottlenecks, ensure fair market compensation with 100% Solatium under RFCTLARR Act 2013, and provide real-time spatial monitoring across all Indian States and Union Territories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>Statutory & Legal Framework</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            The platform enforces full statutory compliance with the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR), National Highways Act, 1956 (Sections 3A to 3J), Railways Act, 1989, and State-specific land revenue codes.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
            <Users className="w-5 h-5" />
            <span>Citizen Privacy & DPDP Act 2023</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            In compliance with the Digital Personal Data Protection Act, 2023, public portals anonymize landholder names, contact details, and Aadhaar numbers. Citizens can verify project progress and corridor alignments without exposing sensitive personal identifiers.
          </p>
        </div>
      </div>
    </div>
  );
}
