import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import { FileCheck2, Search, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProposalList({ projects = [], onSelectProject }) {
  const [search, setSearch] = useState('');

  const proposals = projects.map(p => ({
    id: `PROP-2025-${p.project_code}`,
    project_id: p.id,
    projectName: p.name,
    projectCode: p.project_code,
    agency: p.implementing_agency,
    state: p.state_name,
    district: p.district_name,
    date: '2025-02-10',
    status: p.current_status === 'DRAFT' ? 'DRAFT' : (p.current_status === 'SUBMITTED' ? 'SUBMITTED' : 'APPROVED')
  }));

  const filtered = proposals.filter(pr => {
    if (search) {
      const q = search.toLowerCase();
      return pr.projectName.toLowerCase().includes(q) || pr.projectCode.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <span>Land Acquisition Proposals & Scrutiny Registry</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Proposals submitted by Implementing Agencies (NHAI, RVNL) under scrutiny by District CALA and State Revenue.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search proposal or project..."
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
                <th className="p-3.5">Proposal ID</th>
                <th className="p-3.5">Project Name & Code</th>
                <th className="p-3.5">Implementing Agency</th>
                <th className="p-3.5">District & State</th>
                <th className="p-3.5">Submission Date</th>
                <th className="p-3.5">Scrutiny Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(pr => (
                <tr key={pr.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{pr.id}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">{pr.projectName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{pr.projectCode}</div>
                  </td>
                  <td className="p-3.5 text-slate-700">{pr.agency}</td>
                  <td className="p-3.5">{pr.district}, {pr.state}</td>
                  <td className="p-3.5 text-slate-500">{pr.date}</td>
                  <td className="p-3.5"><Badge status={pr.status} size="xs" /></td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => onSelectProject && onSelectProject(pr.project_id, 'workflow')}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg text-xs"
                    >
                      Scrutinize &rarr;
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
