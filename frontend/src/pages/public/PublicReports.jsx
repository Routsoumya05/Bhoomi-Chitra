import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import Badge from '../../components/common/Badge';
import { BarChart3, Download, Printer, Filter } from 'lucide-react';

export default function PublicReports() {
  const [reportData, setReportData] = useState(null);
  const [selectedState, setSelectedState] = useState('');
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStates().then(r => { if (r.success) setStates(r.data); });
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.getMisReports({ stateId: selectedState || undefined });
      if (res.success) setReportData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedState]);

  // CSV Export
  const handleExportCsv = () => {
    if (!reportData || !reportData.data) return;
    const rows = reportData.data;
    const headers = ['Project Code', 'Project Name', 'Sector', 'State', 'District', 'Required Land (Ha)', 'Acquired Land (Ha)', 'Status', 'Risk Score'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.project_code}"`,
        `"${r.project_name}"`,
        `"${r.project_type}"`,
        `"${r.state_name}"`,
        `"${r.district_name}"`,
        r.required_land_ha,
        r.acquired_land_ha,
        `"${r.current_status}"`,
        r.risk_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `BHOOMI_CHITRA_National_MIS_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>National MIS Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated statutory progress, physical possession rates, and financial compensation summaries.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
          >
            <option value="">All Indian States</option>
            {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      {reportData && reportData.reportMeta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Projects Listed</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{reportData.reportMeta.totalRecords}</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Land Proposed</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{reportData.reportMeta.summary.totalProposedHa} Ha</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Land Acquired</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">{reportData.reportMeta.summary.totalAcquiredHa} Ha</span>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Overall Possession Rate</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">{reportData.reportMeta.summary.acquisitionPct}%</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Project Code</th>
                <th className="p-3">Project Name</th>
                <th className="p-3">Sector</th>
                <th className="p-3">State & District</th>
                <th className="p-3">Proposed</th>
                <th className="p-3">Acquired</th>
                <th className="p-3">Status</th>
                <th className="p-3">Risk Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">Loading statutory reports...</td>
                </tr>
              ) : (
                (reportData?.data || []).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-slate-900">{r.project_code}</td>
                    <td className="p-3 font-semibold text-slate-800">{r.project_name}</td>
                    <td className="p-3 text-slate-600">{r.project_type}</td>
                    <td className="p-3">{r.district_name}, {r.state_name}</td>
                    <td className="p-3">{r.required_land_ha} Ha</td>
                    <td className="p-3 font-bold text-emerald-700">{r.acquired_land_ha} Ha</td>
                    <td className="p-3"><Badge status={r.current_status} size="xs" /></td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        r.risk_score >= 61 ? 'bg-rose-100 text-rose-800' : (r.risk_score >= 31 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                      }`}>
                        {r.risk_score} / 100
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
