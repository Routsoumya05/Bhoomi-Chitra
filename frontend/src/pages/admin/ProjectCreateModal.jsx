import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ProjectCreateModal({ isOpen, onClose, onProjectCreated }) {
  const { user } = useAuth();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState('HIGHWAY');
  const [ministry, setMinistry] = useState('Ministry of Road Transport & Highways (MoRTH)');
  const [implementingAgency, setImplementingAgency] = useState('National Highways Authority of India (NHAI)');
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedCostCr, setEstimatedCostCr] = useState('');
  const [requiredLandHa, setRequiredLandHa] = useState('');
  const [targetCompletionDate, setTargetCompletionDate] = useState('2027-12-31');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getStates().then(r => {
        if (r.success) {
          setStates(r.data);
          if (r.data.length > 0) {
            setStateId(r.data[0].id);
            api.getDistricts(r.data[0].id).then(dr => {
              if (dr.success) {
                setDistricts(dr.data);
                if (dr.data.length > 0) setDistrictId(dr.data[0].id);
              }
            });
          }
        }
      });
    }
  }, [isOpen]);

  const handleStateChange = (e) => {
    const sId = e.target.value;
    setStateId(sId);
    api.getDistricts(sId).then(dr => {
      if (dr.success) {
        setDistricts(dr.data);
        if (dr.data.length > 0) setDistrictId(dr.data[0].id);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await api.createProject({
        name,
        projectType,
        ministry,
        implementingAgency,
        stateId: parseInt(stateId, 10),
        districtId: parseInt(districtId, 10),
        description,
        estimatedCostCr: parseFloat(estimatedCostCr) || 0,
        requiredLandHa: parseFloat(requiredLandHa) || 0,
        targetCompletionDate
      });

      if (res.success) {
        if (onProjectCreated) onProjectCreated(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create project proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Initiate New Land Acquisition Project Proposal" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
            Project Title / Corridor Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NH-16 Greenfield Coastal Bypass Corridor Package 1"
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#0f2942]"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Infrastructure Sector</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
            >
              <option value="HIGHWAY">Highway / Expressway</option>
              <option value="RAILWAY">Railway / Dedicated Freight</option>
              <option value="METRO">Metro / Urban Transit</option>
              <option value="PORT">Port / Maritime Logistics</option>
              <option value="AIRPORT">Greenfield Airport</option>
              <option value="IRRIGATION">River Basin Irrigation</option>
              <option value="INDUSTRIAL">Industrial Corridor / SEZ</option>
              <option value="RENEWABLE">Solar / Wind Energy Park</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Nodal Ministry</label>
            <input
              type="text"
              value={ministry}
              onChange={(e) => setMinistry(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Implementing Agency</label>
            <input
              type="text"
              value={implementingAgency}
              onChange={(e) => setImplementingAgency(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Target Completion Date</label>
            <input
              type="date"
              value={targetCompletionDate}
              onChange={(e) => setTargetCompletionDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
            <select
              value={stateId}
              onChange={handleStateChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
            >
              {states.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">District</label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
            >
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Required Land (Hectares)</label>
            <input
              type="number"
              step="0.01"
              value={requiredLandHa}
              onChange={(e) => setRequiredLandHa(e.target.value)}
              placeholder="e.g. 185.5"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Estimated Cost (₹ Crores)</label>
            <input
              type="number"
              step="0.1"
              value={estimatedCostCr}
              onChange={(e) => setEstimatedCostCr(e.target.value)}
              placeholder="e.g. 1450"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Project Description & Justification</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief statutory summary of project alignment, SIA findings, and economic significance..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#0f2942] text-white py-2.5 rounded-xl font-bold shadow hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Submitting Proposal...' : 'Create & Initiate Acquisition Proposal'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
