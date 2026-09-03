import React from 'react';
import StatCard from '../components/common/StatCard';
import {
  Shield,
  Users,
  MapPin,
  FolderKanban,
  FileCheck2,
  CircleDollarSign,
  Home,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  ExternalLink
} from 'lucide-react';

export default function LandingPage({
  kpis,
  onOpenPublicPortal,
  onOpenAdminLogin,
  onSelectFlagshipProject
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0f2942] via-[#133353] to-[#0f2942] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Emblem Crest & Tag */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-amber-500/40 text-xs font-semibold text-amber-300 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Government of India • Ministry of Rural Development (DoLR)</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-3">
            BHOOMI CHITRA
          </h1>
          <h2 className="text-lg sm:text-2xl font-bold text-amber-400 tracking-wide mb-4">
            National Land Acquisition & Management System
          </h2>
          <p className="text-base sm:text-xl font-medium text-slate-200 mb-3 max-w-3xl mx-auto">
            "One Platform. Every Parcel. Complete Transparency."
          </p>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Digitizing land acquisition from proposal to possession through GIS, automated workflows, real-time monitoring and data-driven governance across all Indian States and Union Territories.
          </p>

          {/* TWO PROMINENT LOGIN/PORTAL CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {/* CARD 1: PUBLIC USER */}
            <div
              onClick={onOpenPublicPortal}
              className="group bg-white text-slate-900 rounded-2xl p-6 sm:p-8 text-left border-2 border-blue-200 shadow-xl hover:shadow-2xl hover:border-blue-500 transition-all cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Citizen & Public Access</span>
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">
                    PUBLIC USER
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                View & explore national statistics, state progress, project timelines, interactive GIS parcels with masked citizen privacy, and public notices.
              </p>
              <div className="flex items-center text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                <span>Enter Public Portal (Read-Only)</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>

            {/* CARD 2: ADMINISTRATIVE LOGIN */}
            <div
              onClick={onOpenAdminLogin}
              className="group bg-[#0f2942] text-white rounded-2xl p-6 sm:p-8 text-left border-2 border-amber-500/50 shadow-xl hover:shadow-2xl hover:border-amber-400 transition-all cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Authorized Government Access</span>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    ADMINISTRATIVE LOGIN
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                Dedicated control center for Central Ministry, State Revenue, District CALA, Project Implementing Agencies (NHAI/RVNL), and Field Officers.
              </p>
              <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Authorized Administrative Login</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </div>
            </div>
          </div>

          {/* Flagship Project Quick Showcase Banner */}
          <div
            onClick={onSelectFlagshipProject}
            className="inline-flex items-center space-x-3 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer shadow transition-all hover:border-amber-400"
          >
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 font-bold text-[10px]">
              SHOWCASE DEMO
            </span>
            <span>
              Flagship Project: <strong>NH-55 4-Laning Expansion Corridor (Odisha - Dhenkanal)</strong>
            </span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </section>

      {/* National Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full mb-12">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Live National Land Acquisition Aggregates</h3>
              <p className="text-sm font-bold text-slate-800">Across 5 States • 10 Districts • 15 Strategic Projects</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Live Database Synchronized</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Projects</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{kpis?.totalProjects || 15}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Land Proposed</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{kpis?.landProposedHa || 3977.5} <span className="text-xs font-normal">Ha</span></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Land Notified</span>
              <span className="text-xl font-black text-blue-700 block mt-1">{kpis?.landNotifiedHa || 3520.0} <span className="text-xs font-normal">Ha</span></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Land Acquired</span>
              <span className="text-xl font-black text-emerald-700 block mt-1">{kpis?.landAcquiredHa || 2012.7} <span className="text-xs font-normal">Ha</span></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Compensation Paid</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">₹{((kpis?.compensationPaidInr || 1184000000) / 10000000).toFixed(1)} <span className="text-xs font-normal">Cr</span></span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Affected Families</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{kpis?.affectedFamiliesCount || 420}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Displaced Families</span>
              <span className="text-xl font-black text-amber-700 block mt-1">{kpis?.displacedFamiliesCount || 138}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">R&R Completion</span>
              <span className="text-xl font-black text-purple-700 block mt-1">{kpis?.rrCompletionPct || 76.8}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Integrated National Land Acquisition Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Engineered to streamline inter-agency coordination between Central Ministries, State Revenue, District Authorities, and Citizens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">PostGIS & Cadastral Geospatial Engine</h3>
            <p className="text-slate-600 leading-relaxed">
              Every parcel georeferenced with OpenStreetMap and Satellite imagery. Color-coded status progression from Proposed to Award and Possession Handover.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">13-Stage Statutory Workflow Engine</h3>
            <p className="text-slate-600 leading-relaxed">
              End-to-end statutory milestones under RFCTLARR Act 2013: Scrutiny, Sec 3A/11 notifications, Joint Measurement Surveys, Award Orders, and PFMS DBT disbursement.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Predictive Acquisition Risk Index (0-100)</h3>
            <p className="text-slate-600 leading-relaxed">
              Transparent rule-based scoring engine calculating project litigation risks, compensation backlog, and milestone delays with actionable statutory recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
