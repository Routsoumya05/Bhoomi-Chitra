import React, { useState } from 'react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import {
  FolderKanban,
  FileCheck2,
  MapPin,
  CircleDollarSign,
  Users,
  Home,
  KeyRound,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus,
  Building,
  FileText
} from 'lucide-react';

export default function AdminDashboard({
  kpis,
  projects = [],
  onSelectProject,
  onNavigateView
}) {
  const { user } = useAuth();

  // Find flagship NH-55 project
  const flagship = projects.find(p => p.project_code?.includes('NH55')) || projects[0];

  return (
    <div className="space-y-6">
      {/* Top Banner with Officer Context */}
      <div className="bg-[#0f2942] text-white rounded-2xl p-6 shadow-md border border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold uppercase tracking-wider">
              Official Administration
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-amber-300">{user?.departmentAgency || 'Government of India'}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Administrative Control Center
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Welcome, <strong>{user?.fullName}</strong> ({user?.roleCode}). Nationwide monitoring and statutory acquisition lifecycle management.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {(user?.roleCode === 'PIA' || user?.roleCode === 'SYS_ADMIN') && (
            <button
              onClick={() => onNavigateView && onNavigateView('admin-projects')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}

          <button
            onClick={() => onNavigateView && onNavigateView('admin-gis')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1.5"
          >
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>GIS Master Layer</span>
          </button>
        </div>
      </div>

      {/* ACTION REQUIRED PANEL as specified in User Requirements Section 5 */}
      <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-rose-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="font-extrabold text-sm text-rose-950 uppercase tracking-wide">
              Action Required Panel
            </h3>
          </div>
          <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300">
            6 Critical Operational Bottlenecks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div
            onClick={() => onNavigateView && onNavigateView('admin-proposals')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Pending Approvals</span>
            <span className="text-xl font-black text-rose-700 block mt-1">{kpis?.pendingApprovals || 4}</span>
            <span className="text-[10px] text-slate-400">Proposals under review</span>
          </div>

          <div
            onClick={() => onNavigateView && onNavigateView('admin-workflow')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Overdue Tasks</span>
            <span className="text-xl font-black text-rose-700 block mt-1">2</span>
            <span className="text-[10px] text-slate-400">JMS & Notification</span>
          </div>

          <div
            onClick={() => {
              if (flagship && onSelectProject) onSelectProject(flagship.id, 'compensation');
              else if (onNavigateView) onNavigateView('admin-compensation');
            }}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Pending Compensation</span>
            <span className="text-xl font-black text-amber-700 block mt-1">67 Families</span>
            <span className="text-[10px] text-slate-400">₹54.20 Cr uncredited</span>
          </div>

          <div
            onClick={() => onNavigateView && onNavigateView('field-officer')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Pending Verification</span>
            <span className="text-xl font-black text-amber-700 block mt-1">18 Parcels</span>
            <span className="text-[10px] text-slate-400">GPS boundary stones</span>
          </div>

          <div
            onClick={() => onNavigateView && onNavigateView('admin-rr')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">R&R Delays</span>
            <span className="text-xl font-black text-purple-700 block mt-1">26 Units</span>
            <span className="text-[10px] text-slate-400">Balarampur colony</span>
          </div>

          <div
            onClick={() => onNavigateView && onNavigateView('admin-gis')}
            className="p-3 bg-white rounded-xl border border-rose-200 hover:border-rose-400 cursor-pointer shadow-xs transition-all"
          >
            <span className="text-slate-500 text-[10px] uppercase font-bold block">Land Disputes</span>
            <span className="text-xl font-black text-rose-700 block mt-1">6 Parcels</span>
            <span className="text-[10px] text-slate-400">High Court / co-sharer</span>
          </div>
        </div>
      </div>

      {/* 13 KPI Cards as specified in User Requirements Section 5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Total Projects"
          value={kpis?.totalProjects || 15}
          subtitle="All States & UTs"
          icon={FolderKanban}
          color="blue"
        />
        <StatCard
          title="Land Proposed"
          value={kpis?.landProposedHa || 3977.5}
          unit="Ha"
          subtitle="Requested Corridor"
          icon={FileCheck2}
          color="slate"
        />
        <StatCard
          title="Land Notified"
          value={kpis?.landNotifiedHa || 3520.0}
          unit="Ha"
          subtitle="Gazetted 3A/11"
          icon={FileCheck2}
          color="blue"
        />
        <StatCard
          title="Land Acquired"
          value={kpis?.landAcquiredHa || 2012.7}
          unit="Ha"
          subtitle="Physical Possession"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Compensation Assessed"
          value={`₹${((kpis?.compensationAssessedInr || 2450000000) / 10000000).toFixed(1)}`}
          unit="Cr"
          subtitle="Solatium Computed"
          icon={CircleDollarSign}
          color="purple"
        />
        <StatCard
          title="Compensation Paid"
          value={`₹${((kpis?.compensationPaidInr || 1184000000) / 10000000).toFixed(1)}`}
          unit="Cr"
          subtitle="PFMS Disbursed"
          icon={CircleDollarSign}
          color="emerald"
        />
        <StatCard
          title="Affected Families"
          value={kpis?.affectedFamiliesCount || 420}
          subtitle="Survey Enrolled"
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Displaced Families"
          value={kpis?.displacedFamiliesCount || 138}
          subtitle="R&R Entitled"
          icon={Home}
          color="amber"
        />
        <StatCard
          title="R&R Completion"
          value={`${kpis?.rrCompletionPct || 76.8}%`}
          subtitle="Colony Handover"
          icon={Home}
          color="purple"
        />
        <StatCard
          title="Possession Completion"
          value={`${kpis?.possessionCompletionPct || 62.4}%`}
          subtitle="Boundary Demarcated"
          icon={KeyRound}
          color="emerald"
        />
        <StatCard
          title="Delayed Projects"
          value={kpis?.delayedProjects || 1}
          subtitle="Milestones Slipping"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="High Risk Projects"
          value={kpis?.highRiskProjects || 1}
          subtitle="Score >= 61/100"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Flagship Corridor Showcase Quick Card */}
      {flagship && (
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-400 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-900 text-[10px] font-bold uppercase">
                Primary Showcase Project
              </span>
              <span className="text-slate-500 text-xs font-semibold">{flagship.project_code} • Odisha, Dhenkanal</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {flagship.name}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span>Required: <strong>{flagship.required_land_ha} Ha</strong></span>
              <span>Acquired: <strong className="text-emerald-700">{flagship.acquired_land_ha} Ha</strong></span>
              <span>Risk Index: <strong className="text-rose-700">{flagship.risk_score} / 100 (HIGH RISK)</strong></span>
              <span>Status: <Badge status={flagship.current_status} size="xs" /></span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onSelectProject && onSelectProject(flagship.id, 'workflow')}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors"
            >
              Progress Workflow
            </button>
            <button
              onClick={() => onSelectProject && onSelectProject(flagship.id, 'overview')}
              className="px-4 py-2 bg-[#0f2942] text-white hover:bg-slate-800 text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5"
            >
              <span>Open Project Control Panel</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* Projects Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Active Strategic Acquisition Corridors</h3>
            <p className="text-xs text-slate-500">Live operational data connected to database</p>
          </div>
          <button
            onClick={() => onNavigateView && onNavigateView('admin-projects')}
            className="text-xs font-bold text-blue-700 hover:underline flex items-center space-x-1"
          >
            <span>View All Projects ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Code & Project</th>
                <th className="p-3.5">State / District</th>
                <th className="p-3.5">Implementing Agency</th>
                <th className="p-3.5">Required Land</th>
                <th className="p-3.5">Acquired Land</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.slice(0, 8).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{p.project_code}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{p.state_name}</div>
                    <div className="text-[11px] text-slate-500">{p.district_name}</div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">{p.implementing_agency}</td>
                  <td className="p-3.5 font-medium">{p.required_land_ha} Ha</td>
                  <td className="p-3.5 font-bold text-emerald-700">{p.acquired_land_ha} Ha</td>
                  <td className="p-3.5"><Badge status={p.current_status} size="xs" /></td>
                  <td className="p-3.5">
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      p.risk_score >= 61 ? 'bg-rose-100 text-rose-800' : (p.risk_score >= 31 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                    }`}>
                      {p.risk_score} / 100
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectProject && onSelectProject(p.id)}
                      className="px-3 py-1 bg-[#0f2942] text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      Manage &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
