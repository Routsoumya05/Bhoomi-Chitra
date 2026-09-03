import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Building2, MapPin, Search, Filter, ShieldCheck, Landmark, CheckCircle2 } from 'lucide-react';

export default function PublicDistricts() {
  const [districts, setDistricts] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [distRes, stateRes] = await Promise.all([
          api.getDistricts(),
          api.getStates()
        ]);
        if (distRes.success) setDistricts(distRes.data);
        if (stateRes.success) setStates(stateRes.data);
      } catch (e) {
        console.error('Error fetching districts:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDistricts = districts.filter(d => {
    const matchesSearch = 
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.headquarters || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.state_name || '').toLowerCase().includes(search.toLowerCase());

    const matchesState = selectedState ? String(d.state_id) === String(selectedState) : true;
    return matchesSearch && matchesState;
  });

  const formatCoord = (val) => {
    if (val === null || val === undefined || isNaN(Number(val))) return 'N/A';
    return Number(val).toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span>District Authorities & CALA Jurisdiction</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Competent Authority Land Acquisition (CALA) offices overseeing Section 3G awards, JMS joint surveys, and direct benefit compensation disbursals under RFCTLARR & NH Act.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total CALA</span>
            <span className="text-base font-black text-slate-800">{districts.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Active Units</span>
            <span className="text-base font-black text-emerald-800">{districts.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search district name, code, headquarters, or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all"
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0f2942] focus:bg-white transition-all appearance-none cursor-pointer"
          >
            <option value="">All States / UTs</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-10 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredDistricts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center">
          <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No District CALA Authorities Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or state filter.</p>
          <button
            onClick={() => { setSearch(''); setSelectedState(''); }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* District Cards Grid */}
      {!loading && filteredDistricts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {filteredDistricts.map(d => (
            <div
              key={d.id}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {d.code}
                      </span>
                      {d.state_name && (
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {d.state_name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1.5 flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{d.name}</span>
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-black tracking-wider uppercase shrink-0">
                    CALA
                  </span>
                </div>

                <div className="mt-3 p-3 bg-slate-50/80 rounded-xl space-y-1.5 text-slate-600 text-[11px] border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Headquarters:</span>
                    <strong className="text-slate-800">{d.headquarters || d.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS Centroid:</span>
                    <span className="font-mono text-slate-700">
                      {formatCoord(d.center_lat)}° N, {formatCoord(d.center_lng)}° E
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                <span className="text-slate-500 font-medium flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Special Land Acquisition Office</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Active</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
