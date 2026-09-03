import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import { Search, Filter, FolderKanban, MapPin, Building, ArrowRight } from 'lucide-react';

export default function PublicProjects({ projects = [], onSelectProject }) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');

  const types = Array.from(new Set(projects.map(p => p.project_type))).filter(Boolean);
  const states = Array.from(new Set(projects.map(p => p.state_name))).filter(Boolean);

  const filtered = projects.filter(p => {
    if (selectedType !== 'ALL' && p.project_type !== selectedType) return false;
    if (selectedState !== 'ALL' && p.state_name !== selectedState) return false;
    if (search) {
      const q = search.toLowerCase();
      const n = (p.name || '').toLowerCase();
      const c = (p.project_code || '').toLowerCase();
      const m = (p.ministry || '').toLowerCase();
      if (!n.includes(q) && !c.includes(q) && !m.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            National Land Acquisition Projects Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse public information on notified, surveyed and acquired infrastructure projects
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project name or code..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-48 md:w-60 focus:ring-1 focus:ring-[#0f2942]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
          >
            <option value="ALL">All Sectors</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
          >
            <option value="ALL">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div
            key={p.id}
            onClick={() => onSelectProject && onSelectProject(p.id)}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between text-xs group"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {p.project_code}
                </span>
                <Badge status={p.current_status} size="xs" />
              </div>

              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug line-clamp-2">
                {p.name}
              </h3>

              <div className="mt-3 space-y-1.5 text-slate-600 text-[11px]">
                <div className="flex items-center space-x-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.implementing_agency}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{p.district_name}, {p.state_name}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Required Land</span>
                <span className="font-bold text-slate-800">{p.required_land_ha} Ha</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Acquired</span>
                <span className="font-bold text-emerald-700">{p.acquired_land_ha} Ha</span>
              </div>
              <div className="text-blue-700 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                <span>Details &rarr;</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
