import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { History, Search, Filter, ShieldAlert, RefreshCw } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({ limit: 100 });
      if (res.success) setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const entities = Array.from(new Set(logs.map(l => l.entity))).filter(Boolean);

  const filtered = logs.filter(l => {
    if (selectedEntity !== 'ALL' && l.entity !== selectedEntity) return false;
    if (search) {
      const q = search.toLowerCase();
      const u = (l.user_name || '').toLowerCase();
      const a = (l.action || '').toLowerCase();
      const id = (l.entity_id || '').toLowerCase();
      if (!u.includes(q) && !a.includes(q) && !id.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <History className="w-5 h-5 text-purple-600" />
            <span>National System Audit Trail & Compliance Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, timestamped record of every administrative modification, approval, status change, and disbursement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh audit log"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, action, entity ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
        >
          <option value="ALL">All Entities</option>
          {entities.map(ent => <option key={ent} value={ent}>{ent}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Officer / User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">Entity ID</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Session Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-slate-500 text-[11px]">{new Date(a.created_at).toLocaleString()}</td>
                  <td className="p-3.5 font-bold font-sans text-slate-900">{a.user_name}</td>
                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {a.role}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-blue-700">{a.action}</td>
                  <td className="p-3.5 font-sans font-semibold text-slate-800">{a.entity}</td>
                  <td className="p-3.5 font-bold text-slate-900">{a.entity_id}</td>
                  <td className="p-3.5 text-slate-500 text-[10px]">{a.ip_address}</td>
                  <td className="p-3.5 text-slate-400 text-[10px]">{a.session_ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
