import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Map, Building2, Layers, TrendingUp } from 'lucide-react';

export default function PublicStates({ onSelectState }) {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.getStates();
        if (res.success) setStates(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Map className="w-5 h-5 text-blue-600" />
          <span>State-Wise Land Acquisition Progress</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Comparative land acquisition metrics, notified corridors, and completed possessions across Indian States and Union Territories.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">State Code & Name</th>
                <th className="p-3.5">Capital</th>
                <th className="p-3.5">Districts</th>
                <th className="p-3.5">Active Corridors</th>
                <th className="p-3.5">Land Acquired</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {states.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="ml-2 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s.code}</span>
                  </td>
                  <td className="p-3.5 text-slate-600">{s.capital}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{s.total_districts}</td>
                  <td className="p-3.5 font-bold text-blue-700">3 Strategic Projects</td>
                  <td className="p-3.5 font-bold text-emerald-700">385.4 Ha</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      ACTIVE IMPLEMENTATION
                    </span>
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
