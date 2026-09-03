import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import ProjectCreateModal from './ProjectCreateModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  MapPin,
  Building,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function ProjectList({
  projects = [],
  onSelectProject,
  onRefreshProjects
}) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const sectors = Array.from(new Set(projects.map(p => p.project_type))).filter(Boolean);
  const statuses = Array.from(new Set(projects.map(p => p.current_status))).filter(Boolean);

  const filtered = projects.filter(p => {
    if (selectedSector !== 'ALL' && p.project_type !== selectedSector) return false;
    if (selectedStatus !== 'ALL' && p.current_status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const n = (p.name || '').toLowerCase();
      const c = (p.project_code || '').toLowerCase();
      const s = (p.state_name || '').toLowerCase();
      const d = (p.district_name || '').toLowerCase();
      if (!n.includes(q) && !c.includes(q) && !s.includes(q) && !d.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FolderKanban className="w-5 h-5 text-blue-600" />
            <span>National Infrastructure Projects Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage acquisition proposals, statutory milestones, and compensation across all 15 active corridors.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(user?.roleCode === 'PIA' || user?.roleCode === 'SYS_ADMIN') && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-[#0f2942] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Initiate Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search project name, code, state, district..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          <option value="ALL">All Sectors</option>
          {sectors.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          <option value="ALL">All Statuses</option>
          {statuses.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Code & Project</th>
                <th className="p-3.5">State / District</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5">Agency</th>
                <th className="p-3.5">Required Land</th>
                <th className="p-3.5">Acquired Land</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{p.project_code}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-800">{p.state_name}</div>
                    <div className="text-[11px] text-slate-500">{p.district_name}</div>
                  </td>
                  <td className="p-3.5 font-medium">{p.project_type}</td>
                  <td className="p-3.5 font-medium text-slate-600">{p.implementing_agency}</td>
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
                      className="px-3 py-1 bg-[#0f2942] text-white rounded-lg font-bold hover:bg-slate-800 transition-colors"
                    >
                      Control Center &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      <ProjectCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={() => {
          if (onRefreshProjects) onRefreshProjects();
        }}
      />
    </div>
  );
}
