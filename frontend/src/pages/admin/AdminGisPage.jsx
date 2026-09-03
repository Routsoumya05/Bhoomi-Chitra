import React from 'react';
import GisMap from '../../components/gis/GisMap';
import { MapPin, Shield } from 'lucide-react';

export default function AdminGisPage({
  geoJsonData,
  projects = [],
  selectedProjectId,
  onSelectProject,
  onRefresh
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <span>Cadastral GIS Control Center & Land Parcel Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any parcel to inspect unmasked titleholder data, change statutory acquisition status, or record litigation disputes.
          </p>
        </div>
        <div className="text-xs text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 font-bold flex items-center space-x-1">
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>Authorized Administrative Modification Mode</span>
        </div>
      </div>

      <div className="h-[calc(100vh-210px)] min-h-[600px] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <GisMap
          geoJsonData={geoJsonData}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
}
