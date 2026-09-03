import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Network, Database, Layers, CheckCircle2, ArrowRight, RefreshCw, Code2 } from 'lucide-react';

export default function PublicIntegrations() {
  const [activeAdapter, setActiveAdapter] = useState('land-records');
  const [adapterResponse, setAdapterResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAdapterData = async (type) => {
    try {
      setLoading(true);
      let res;
      if (type === 'land-records') {
        res = await api.getLandRecordsMock({ state: 'OD', district: 'Dhenkanal', village: 'Gondia', khasra: '102/4' });
      } else if (type === 'cadastral') {
        res = await api.getCadastralMock({ state: 'OD', district: 'Dhenkanal', village: 'Gondia' });
      } else {
        res = await api.getProjectDataMock({ projectCode: 'NHAI-OD-NH55-01' });
      }
      setAdapterResponse(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdapterData(activeAdapter);
  }, [activeAdapter]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Network className="w-5 h-5 text-blue-600" />
          <span>Government Data Integration & Cadastral API Architecture</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          BHOOMI CHITRA decouples backend business logic from external state revenue systems using an extensible adapter pattern.
          Currently configured with realistic MVP simulations, designed for immediate production drop-in with NIC web services.
        </p>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center space-x-2">
          <Code2 className="w-4 h-4" />
          <span>4-Tier API Integration Flow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 1</span>
            <span className="font-bold text-white mt-1 block">React GIS Client</span>
            <span className="text-[11px] text-slate-400 mt-1 block">GeoJSON Layer Rendering</span>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 2</span>
            <span className="font-bold text-white mt-1 block">BHOOMI REST API</span>
            <span className="text-[11px] text-slate-400 mt-1 block">JWT & RBAC Security</span>
          </div>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tier 3</span>
            <span className="font-bold text-white mt-1 block">Integration Service</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Contract Normalizer</span>
          </div>
          <div className="p-4 bg-blue-950/60 rounded-xl border border-blue-600/50">
            <span className="text-[10px] uppercase font-bold text-blue-400 block">Tier 4 (Extensible)</span>
            <span className="font-bold text-amber-300 mt-1 block">Govt Adapters</span>
            <span className="text-[11px] text-slate-300 mt-1 block">Bhulekh / BhuNaksha / NMP</span>
          </div>
        </div>
      </div>

      {/* Interactive Adapter Simulator */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveAdapter('land-records')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeAdapter === 'land-records'
                  ? 'bg-[#0f2942] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Bhulekh / Bhoomi RoR Adapter
            </button>
            <button
              onClick={() => setActiveAdapter('cadastral')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeAdapter === 'cadastral'
                  ? 'bg-[#0f2942] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              NIC BhuNaksha WFS Cadastral
            </button>
            <button
              onClick={() => setActiveAdapter('project-data')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeAdapter === 'project-data'
                  ? 'bg-[#0f2942] text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              PM Gati Shakti NMP Adapter
            </button>
          </div>

          <button
            onClick={() => fetchAdapterData(activeAdapter)}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors"
            title="Re-query adapter"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
            <span className="font-bold">Statutory Transparency Notice:</span> The adapter responses shown below demonstrate real JSON data structures transmitted across the wire (`/api/integrations/*`). In production deployments, authentication keys for State Bhulekh portals, NIC BhuNaksha servers, and Cabinet Secretariat PM Gati Shakti APIs plug seamlessly into these adapter classes.
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
            <pre>{JSON.stringify(adapterResponse, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
