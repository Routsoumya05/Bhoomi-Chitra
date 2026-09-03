import React from 'react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  FolderKanban,
  MapPin,
  CircleDollarSign,
  Users,
  Home,
  KeyRound,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';

export default function PublicDashboard({
  kpis,
  projects = [],
  onSelectProject,
  onNavigateGis
}) {
  return (
    <div className="space-y-6">
      {/* Top Welcome & Citizen Transparency Notice */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
              Citizen Information Portal
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs font-semibold text-slate-500">DoLR, Ministry of Rural Development</span>
          </div>
          <h2 className="text-2xl font-black text-[#0f2942] tracking-tight mt-1">
            National Land Acquisition Public Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Real-time public statistics and statutory progress for national infrastructure, highway expansions, railways, and industrial corridors.
          </p>
        </div>

        <button
          onClick={onNavigateGis}
          className="px-4 py-2.5 bg-[#0f2942] text-white text-xs font-bold rounded-xl shadow hover:bg-slate-800 transition-colors flex items-center space-x-2 shrink-0"
        >
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Explore National GIS Map</span>
        </button>
      </div>

      {/* 9 KPI Cards as specified in User Requirements */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          title="Total Projects"
          value={kpis?.totalProjects || 15}
          subtitle="Across 5 States"
          icon={FolderKanban}
          color="blue"
        />
        <StatCard
          title="Area Notified"
          value={kpis?.landNotifiedHa || 3520.0}
          unit="Ha"
          subtitle="Gazetted under Sec 3A/11"
          icon={FileCheck2}
          color="blue"
        />
        <StatCard
          title="Area Acquired"
          value={kpis?.landAcquiredHa || 2012.7}
          unit="Ha"
          subtitle="Physical Possession Complete"
          icon={MapPin}
          color="emerald"
        />
        <StatCard
          title="Compensation Assessed"
          value={`₹${((kpis?.compensationAssessedInr || 2450000000) / 10000000).toFixed(1)}`}
          unit="Cr"
          subtitle="Basic + 100% Solatium"
          icon={CircleDollarSign}
          color="purple"
        />
        <StatCard
          title="Compensation Paid"
          value={`₹${((kpis?.compensationPaidInr || 1184000000) / 10000000).toFixed(1)}`}
          unit="Cr"
          subtitle="Direct Beneficiary DBT"
          icon={CircleDollarSign}
          color="emerald"
        />
        <StatCard
          title="Affected Families"
          value={kpis?.affectedFamiliesCount || 420}
          subtitle="Identified in Survey"
          icon={Users}
          color="slate"
        />
        <StatCard
          title="Displaced Families"
          value={kpis?.displacedFamiliesCount || 138}
          subtitle="Eligible for R&R Colony"
          icon={Home}
          color="amber"
        />
        <StatCard
          title="R&R Completion"
          value={`${kpis?.rrCompletionPct || 76.8}%`}
          subtitle="Relocation & Livelihood"
          icon={Home}
          color="purple"
        />
        <StatCard
          title="Possession Completion"
          value={`${kpis?.possessionCompletionPct || 62.4}%`}
          subtitle="Boundary Stone Erection"
          icon={KeyRound}
          color="emerald"
        />
      </div>

      {/* Flagship Corridor Highlight Box */}
      <div className="bg-gradient-to-r from-blue-900 via-[#0f2942] to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900 text-[10px] font-bold uppercase">
              Showcase Corridor
            </span>
            <span className="text-slate-300 text-xs font-semibold">Odisha • Dhenkanal</span>
          </div>
          <h3 className="text-xl font-extrabold mt-1 text-white">
            NH-55 4-Laning Expansion (Cuttack - Dhenkanal - Angul Section)
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Key mineral transit corridor connecting Paradip Port with Talcher industrial mining cluster. Active statutory compensation and physical possession underway.
          </p>
        </div>

        <button
          onClick={() => {
            const nh55 = projects.find(p => p.project_code?.includes('NH55')) || projects[0];
            if (nh55 && onSelectProject) onSelectProject(nh55.id);
          }}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow transition-all flex items-center space-x-1.5 shrink-0"
        >
          <span>View Corridor Public Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Public Projects Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm text-slate-900">National Infrastructure Projects Status</h3>
            <p className="text-xs text-slate-500">Publicly gazetted projects and acquisition progress</p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{projects.length} Total Projects</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Project Code & Name</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5">State / District</th>
                <th className="p-3.5">Required Land</th>
                <th className="p-3.5">Acquired Land</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Public View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{p.project_code}</div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{p.project_type}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-slate-800">{p.state_name}</div>
                    <div className="text-[11px] text-slate-500">{p.district_name}</div>
                  </td>
                  <td className="p-3.5 font-medium">{p.required_land_ha} Ha</td>
                  <td className="p-3.5 font-bold text-emerald-700">{p.acquired_land_ha} Ha</td>
                  <td className="p-3.5">
                    <Badge status={p.current_status} size="xs" />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectProject && onSelectProject(p.id)}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors"
                    >
                      Explore &rarr;
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
