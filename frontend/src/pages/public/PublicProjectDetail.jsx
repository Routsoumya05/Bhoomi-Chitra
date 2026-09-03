import React, { useState, useEffect } from 'react';
import Badge from '../../components/common/Badge';
import GisMap from '../../components/gis/GisMap';
import { api } from '../../services/api';
import {
  FolderKanban,
  MapPin,
  CircleDollarSign,
  Users,
  Home,
  KeyRound,
  FileCheck2,
  Calendar,
  Building,
  ArrowLeft,
  FileText,
  Clock,
  Layers,
  Download
} from 'lucide-react';

export default function PublicProjectDetail({ projectId, onBack }) {
  const [project, setProject] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'gis', 'parcels', 'timeline', 'compensation', 'rr', 'docs'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [pRes, parcelsRes, geoRes] = await Promise.all([
          api.getProjectById(projectId),
          api.getParcels({ projectId }),
          api.getGeoJson({ projectId })
        ]);

        if (pRes.success) setProject(pRes.data);
        if (parcelsRes.success) setParcels(parcelsRes.data);
        if (geoRes.type === 'FeatureCollection') setGeoJsonData(geoRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
        Loading public project records...
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'gis', label: 'GIS Parcel Map' },
    { id: 'parcels', label: `Public Parcels (${parcels.length})` },
    { id: 'timeline', label: 'Timeline & Milestones' },
    { id: 'compensation', label: 'Compensation Summary' },
    { id: 'rr', label: 'R&R Progress' },
    { id: 'docs', label: 'Public Gazettes & Documents' }
  ];

  return (
    <div className="space-y-5">
      {/* Top Breadcrumb & Title Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="text-xs text-blue-700 font-bold hover:underline mb-3 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects Directory</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase">
                {project.project_code}
              </span>
              <Badge status={project.current_status} size="xs" />
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-bold">
                {project.project_type}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#0f2942] tracking-tight mt-1">
              {project.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Agency: <strong>{project.implementing_agency}</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Location: <strong>{project.district_name}, {project.state_name}</strong></span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Target: <strong>{project.target_completion_date || '2027-03-31'}</strong></span>
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-slate-200 mt-6 overflow-x-auto text-xs font-semibold">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-2.5 px-3 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === t.id
                  ? 'border-[#0f2942] text-[#0f2942] font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-5 text-xs">
          {/* Aggregated KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Required Land</span>
              <span className="text-xl font-black text-slate-900 block mt-1">{project.required_land_ha} Ha</span>
              <span className="text-[11px] text-slate-500">Total corridor right-of-way</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Acquired Land</span>
              <span className="text-xl font-black text-emerald-700 block mt-1">{project.acquired_land_ha} Ha</span>
              <span className="text-[11px] text-slate-500">{((project.acquired_land_ha / (project.required_land_ha || 1)) * 100).toFixed(1)}% possession achieved</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">Compensation Disbursed</span>
              <span className="text-xl font-black text-emerald-800 block mt-1">
                ₹{((project.stats?.total_compensation_paid || 1184000000) / 10000000).toFixed(2)} Cr
              </span>
              <span className="text-[11px] text-slate-500">PFMS Direct Beneficiary DBT</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400">R&R Completion</span>
              <span className="text-xl font-black text-purple-700 block mt-1">
                {project.stats?.rr_completion_percentage || 76.8}%
              </span>
              <span className="text-[11px] text-slate-500">Resettlement & livelihood grant</span>
            </div>
          </div>

          {/* Description & Statutory Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Project Description & Scope</h3>
            <p className="text-slate-600 leading-relaxed text-xs">
              {project.description || 'Four-laning expansion of existing economic corridor to improve industrial transit and passenger safety.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nodal Ministry</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{project.ministry}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Cost</span>
                <span className="font-bold text-slate-800 mt-0.5 block">₹{project.estimated_cost_cr} Crores</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">CALA Authority</span>
                <span className="font-bold text-slate-800 mt-0.5 block">Collectorate & CALA {project.district_name}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gis' && (
        <div className="h-[600px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <GisMap
            geoJsonData={geoJsonData}
            selectedProjectId={projectId}
            projects={[project]}
          />
        </div>
      )}

      {activeTab === 'parcels' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-900">Public Land Parcels Record</h3>
              <p className="text-[11px] text-slate-500">Citizen ownership information is anonymized under the DPDP Act 2023</p>
            </div>
            <span className="font-bold text-slate-700">{parcels.length} Parcels Listed</span>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left">
              <thead className="bg-slate-100/75 text-slate-600 uppercase font-bold text-[10px] tracking-wider sticky top-0">
                <tr>
                  <th className="p-3">Parcel ID</th>
                  <th className="p-3">Village / Tehsil</th>
                  <th className="p-3">Khasra / Plot</th>
                  <th className="p-3">Land Type</th>
                  <th className="p-3">Area</th>
                  <th className="p-3">Acquisition Status</th>
                  <th className="p-3">Owner Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parcels.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{p.parcel_code}</td>
                    <td className="p-3">{p.village} ({p.tehsil || 'Sadar'})</td>
                    <td className="p-3 font-semibold">{p.khasra_survey_no}</td>
                    <td className="p-3"><Badge status={p.land_type || 'AGRICULTURAL'} size="xs" /></td>
                    <td className="p-3 font-medium">{p.area_ha} Ha</td>
                    <td className="p-3"><Badge status={p.status} size="xs" /></td>
                    <td className="p-3">
                      <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {p.masked_owner || 'Owner ID: ******4521'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Statutory Acquisition Schedule</h3>
          <div className="space-y-3">
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Section 3A / 11 Preliminary Notification</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Published in Gazette of India & leading local dailies</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">COMPLETED</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Joint Measurement Survey (JMS) & Public Hearing</span>
                <p className="text-[11px] text-slate-500 mt-0.5">On-site verification with landholders and revenue inspectors</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">COMPLETED</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Declaration of Land Acquisition Award (Sec 3G / 23)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Valuation with 100% Solatium finalized by CALA</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold">COMPLETED</span>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Compensation Disbursement via PFMS DBT</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Direct bank transfer to verified titleholders' Aadhaar-linked accounts</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold animate-pulse">IN PROGRESS</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Physical Land Possession Handover</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Boundary stone erection and certificate issuance to Implementing Agency</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 font-bold">IN PROGRESS</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compensation' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Public Compensation Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Assessed Value</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">₹245.00 Cr</span>
              <span className="text-slate-500 text-[11px]">Basic market value + 100% Solatium + 12% AMV</span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">Total Disbursed to Date</span>
              <span className="text-2xl font-black text-emerald-800 block mt-1">₹118.40 Cr</span>
              <span className="text-emerald-700 text-[11px]">48.3% directly credited via PFMS DBT</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-amber-700 block text-[10px] uppercase font-bold">Balance in Deposit</span>
              <span className="text-2xl font-black text-amber-800 block mt-1">₹126.60 Cr</span>
              <span className="text-amber-700 text-[11px]">Deposited in CALA escrow account</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rr' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Rehabilitation & Resettlement Public Status</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Affected Families</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">420</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Displaced Families</span>
              <span className="text-2xl font-black text-amber-700 block mt-1">138</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Relocation Handover</span>
              <span className="text-2xl font-black text-purple-700 block mt-1">106 / 138</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'docs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
          <h3 className="font-bold text-sm text-slate-900">Public Gazette Notifications & Orders</h3>
          <div className="space-y-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Section 3A Gazette Notification (S.O. 1842(E))</span>
                <p className="text-[11px] text-slate-500">Published by MoRTH under National Highways Act 1956</p>
              </div>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 flex items-center space-x-1">
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900">Competent Authority Award Order No. 42/2025</span>
                <p className="text-[11px] text-slate-500">Final valuation order signed by Collector & CALA Dhenkanal</p>
              </div>
              <button className="px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 flex items-center space-x-1">
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
