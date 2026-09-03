import React from 'react';
import GisMap from '../../components/gis/GisMap';
import { MapPin, Info } from 'lucide-react';

export default function PublicGisPage({
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
            <span>National Public Cadastral & GIS Map</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore acquisition parcels across states. Click any parcel polygon to view area, status, and anonymized ownership reference.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Read-Only Citizen GIS View</span>
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
