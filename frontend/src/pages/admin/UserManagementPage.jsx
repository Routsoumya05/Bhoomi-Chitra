import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, UserCheck, Search, Building } from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.getUsers();
        if (res.success) setUsers(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      return (u.full_name || '').toLowerCase().includes(q) ||
             (u.email || '').toLowerCase().includes(q) ||
             (u.role_code || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span>National Role-Based Access Control & User Directory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            System Administrator control panel for authorizing Central, State, District, PIA, and Field accounts.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search official name, role..."
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-60"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Official Name & Email</th>
                <th className="p-3.5">Role Code</th>
                <th className="p-3.5">Department / Agency</th>
                <th className="p-3.5">Assigned Jurisdiction</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900">{u.full_name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold font-mono">
                      {u.role_code}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">{u.department_agency}</td>
                  <td className="p-3.5 text-slate-600">
                    {u.state_name ? `${u.district_name || 'All Districts'}, ${u.state_name}` : 'National / Pan-India'}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      ACTIVE & AUTHORIZED
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
