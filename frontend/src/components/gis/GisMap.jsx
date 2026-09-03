import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import ParcelDrawer from './ParcelDrawer';
import {
  Layers,
  Search,
  Crosshair,
  Filter,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';

const STATUS_COLORS = {
  'PROPOSED': '#64748b',            // Slate 500
  'NOTIFICATION_ISSUED': '#2563eb', // Blue 600
  'AWARD_DECLARED': '#7c3aed',      // Purple 600
  'COMPENSATION_PENDING': '#d97706',// Amber 600
  'COMPENSATION_PAID': '#059669',   // Emerald 600
  'POSSESSION_COMPLETED': '#15803d',// Forest Green 700
  'DISPUTED': '#dc2626'             // Red 600
};

export default function GisMap({
  geoJsonData,
  loading,
  onRefresh,
  selectedProjectId,
  onSelectProject,
  projects = [],
  states = [],
  selectedStateId,
  onSelectState
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [selectedParcel, setSelectedParcel] = useState(null);
  const [activeTileType, setActiveTileType] = useState('osm'); // 'osm', 'satellite', 'topo'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [landTypeFilter, setLandTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Default centered on India / Odisha
    const map = L.map(mapContainerRef.current, {
      center: [20.6580, 85.5990],
      zoom: 12,
      zoomControl: false
    });

    // Zoom control at top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Initial OSM tiles
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | Govt of India NIC-GIS',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = osmLayer;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let newTileLayer;
    if (activeTileType === 'satellite') {
      newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri World Imagery, Maxar, Earthstar Geographics',
        maxZoom: 19
      });
    } else if (activeTileType === 'topo') {
      newTileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenTopoMap contributors',
        maxZoom: 17
      });
    } else {
      newTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Govt of India NIC-GIS',
        maxZoom: 19
      });
    }

    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [activeTileType]);

  // 3. Render GeoJSON Parcels
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
    }

    // Filter features
    let filteredFeatures = (geoJsonData.features || []).filter(f => {
      const p = f.properties;
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (landTypeFilter !== 'ALL' && p.landType !== landTypeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const code = (p.parcelCode || '').toLowerCase();
        const khasra = (p.khasra || '').toLowerCase();
        const village = (p.village || '').toLowerCase();
        const lType = (p.landType || '').toLowerCase();
        if (!code.includes(q) && !khasra.includes(q) && !village.includes(q) && !lType.includes(q)) return false;
      }
      return true;
    });

    const layer = L.geoJSON({ type: 'FeatureCollection', features: filteredFeatures }, {
      style: (feature) => {
        const status = feature.properties.status;
        const color = STATUS_COLORS[status] || '#64748b';
        return {
          color: color,
          weight: 2,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.45
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const props = feature.properties;
        const color = STATUS_COLORS[props.status] || '#64748b';

        // Hover effect
        featureLayer.on({
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 4, fillOpacity: 0.75 });
          },
          mouseout: (e) => {
            layer.resetStyle(e.target);
          },
          click: () => {
            setSelectedParcel(props);
          }
        });

        // Tooltip
        featureLayer.bindTooltip(`
          <div style="font-family: sans-serif; font-size: 11px; font-weight: bold; color: #0f2942;">
            <div>${props.parcelCode || 'Parcel'}</div>
            <div style="font-size: 10px; color: ${color};">${props.status.replace(/_/g, ' ')}</div>
            <div style="font-size: 10px; color: #0284c7;">${props.landType ? props.landType.replace(/_/g, ' ') : 'Agricultural'}</div>
            <div style="font-size: 10px; color: #475569;">${props.village || ''} • ${props.areaHa} Ha</div>
          </div>
        `, { sticky: true });
      }
    }).addTo(mapInstanceRef.current);

    geoJsonLayerRef.current = layer;

    // Fit bounds if features exist
    if (filteredFeatures.length > 0) {
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      } catch (e) {
        // Safe catch for invalid bounds
      }
    }
  }, [geoJsonData, statusFilter, landTypeFilter, searchQuery]);

  // Fit bounds helper
  const handleFitBounds = () => {
    if (mapInstanceRef.current && geoJsonLayerRef.current) {
      try {
        const bounds = geoJsonLayerRef.current.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
      } catch (e) {}
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex flex-col">
      {/* Top Floating GIS Controls */}
      <div className="absolute top-3 left-14 right-3 z-30 flex flex-wrap gap-2 items-center justify-between pointer-events-none">
        {/* Left Filter Group */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 shadow-md">
          {/* Project select */}
          <select
            value={selectedProjectId || ''}
            onChange={(e) => onSelectProject && onSelectProject(e.target.value || null)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0f2942]"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name.substring(0, 36)}...</option>
            ))}
          </select>

          {/* Status select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0f2942]"
          >
            <option value="ALL">All Statuses</option>
            {Object.keys(STATUS_COLORS).map(st => (
              <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {/* Land Type select */}
          <select
            value={landTypeFilter}
            onChange={(e) => setLandTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 text-slate-800 focus:ring-1 focus:ring-[#0f2942]"
          >
            <option value="ALL">All Land Types</option>
            <option value="GOVT_REVENUE">Govt. Land (Revenue)</option>
            <option value="STATE_STATUTORY">State Statutory / PSU</option>
            <option value="GRAM_SABHA">Gram Sabha / Panchayat</option>
            <option value="FOREST_LAND">Forest Land / Reserve</option>
            <option value="CENTRAL_GOVT">Central Govt / Defence</option>
            <option value="WATER_BODY">Water Body / Canal</option>
            <option value="PRIVATE_AGRICULTURAL">Private Agricultural</option>
            <option value="PRIVATE_COMMERCIAL">Private Commercial</option>
            <option value="PRIVATE_RESIDENTIAL">Private Residential</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Khasra / Village / Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium w-44 md:w-56 focus:ring-1 focus:ring-[#0f2942]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center space-x-1.5 pointer-events-auto bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200 shadow-md">
          {/* Layer switcher */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setActiveTileType('osm')}
              className={`px-2 py-1 rounded-md transition-colors ${activeTileType === 'osm' ? 'bg-[#0f2942] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Streets
            </button>
            <button
              onClick={() => setActiveTileType('satellite')}
              className={`px-2 py-1 rounded-md transition-colors ${activeTileType === 'satellite' ? 'bg-[#0f2942] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveTileType('topo')}
              className={`px-2 py-1 rounded-md transition-colors ${activeTileType === 'topo' ? 'bg-[#0f2942] text-white' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Topo
            </button>
          </div>

          <button
            onClick={handleFitBounds}
            className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Fit to bounds"
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh GIS layer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 shadow-lg text-[11px]">
        <div className="font-bold text-slate-800 uppercase tracking-wide text-[10px] mb-2 flex items-center justify-between">
          <span>Acquisition Parcel Stages</span>
          <span className="text-slate-400 font-normal">({geoJsonData?.features?.length || 0} parcels)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }}></span>
              <span className="text-slate-700 font-medium text-[10px] whitespace-nowrap">{status.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Parcel Drawer */}
      {selectedParcel && (
        <ParcelDrawer
          parcel={selectedParcel}
          onClose={() => setSelectedParcel(null)}
          onStatusUpdated={() => {
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}
