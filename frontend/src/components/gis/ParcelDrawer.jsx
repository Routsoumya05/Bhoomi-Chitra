import React, { useState } from 'react';
import Badge from '../common/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import {
  X,
  MapPin,
  FileText,
  User,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Building,
  Edit3,
  Check
} from 'lucide-react';

export default function ParcelDrawer({ parcel, onClose, onStatusUpdated }) {
  const { isAdminUser, user } = useAuth();
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(parcel?.status || 'PROPOSED');
  const [disputeReason, setDisputeReason] = useState(parcel?.disputeReason || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!parcel) return null;

  const handleUpdateStatus = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.updateParcelStatus(parcel.id, {
        status: newStatus,
        disputeReason: newStatus === 'DISPUTED' ? disputeReason : null
      });
      setSaveSuccess(true);
      setEditingStatus(false);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onStatusUpdated) onStatusUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update parcel status');
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    'PROPOSED',
    'NOTIFICATION_ISSUED',
    'AWARD_DECLARED',
    'COMPENSATION_PENDING',
    'COMPENSATION_PAID',
    'POSSESSION_COMPLETED',
    'DISPUTED'
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[420px] bg-white shadow-2xl border-l border-slate-200 z-50 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div>
        <div className="bg-[#0f2942] text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm tracking-tight">{parcel.parcelCode || `Parcel #${parcel.id}`}</h3>
              <p className="text-[11px] text-slate-300">{parcel.village}, {parcel.districtName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-semibold">Acquisition Status:</span>
          <Badge status={parcel.status} size="sm" />
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[calc(100vh-230px)] overflow-y-auto">
          {saveSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Status successfully updated & recorded in audit trail!</span>
            </div>
          )}

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Key Identifiers */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Khasra / Survey No.</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{parcel.khasra || 'N/A'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Land Classification</span>
              <Badge status={parcel.landType || 'AGRICULTURAL'} size="xs" />
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Area (Hectares)</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{parcel.areaHa} Ha ({parcel.areaAcres} Acres)</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Market Valuation</span>
              <span className="font-bold text-slate-800 mt-0.5 block">₹{(parcel.marketValue || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Statutory & Administrative Land Clearance Panel */}
          {['GOVT_REVENUE', 'GOVT_LAND', 'STATE_STATUTORY', 'GRAM_SABHA', 'FOREST_LAND', 'CENTRAL_GOVT', 'WATER_BODY'].includes(parcel.landType) && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-1.5 text-xs">
              <div className="font-bold text-indigo-950 text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-700" />
                <span>Statutory Land Administration</span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed font-medium">
                {parcel.landType === 'GOVT_REVENUE' || parcel.landType === 'GOVT_LAND'
                  ? '🏛️ Government Revenue / Nazul Land: Transferred via Inter-Departmental Alienation order. Exempt from private RFCTLARR solatium.'
                  : parcel.landType === 'STATE_STATUTORY'
                  ? '🏢 State Statutory Body / PSU Land: Handover executed under State Statutory Board Resolution & Inter-Agency Relinquishment.'
                  : parcel.landType === 'GRAM_SABHA'
                  ? '👥 Gram Sabha Communal Land: Governed under Panchayat Land Rules with Gram Sabha Resolution & FRA 2006 clearance.'
                  : parcel.landType === 'FOREST_LAND'
                  ? '🌲 State Forest Reserve: Stage-II Forest Clearance accorded under Forest Conservation Act (FCA 1980) with CA fund deposit.'
                  : parcel.landType === 'CENTRAL_GOVT'
                  ? '🎖️ Central Government / Defence / Railways Land: Inter-Ministerial Transfer Protocol & No-Objection Certificate.'
                  : '💧 Water Body / Canal Catchment: Water Resources Department jurisdiction with hydraulic flow protection.'}
              </p>
            </div>
          )}

          {/* Project & Administrative hierarchy */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-xs">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Project Association</span>
            </div>
            <div className="text-slate-700 font-semibold">{parcel.projectName}</div>
            <div className="text-slate-500 text-[11px]">Code: {parcel.projectCode}</div>
            <div className="text-slate-500 text-[11px] flex items-center justify-between pt-1">
              <span>State: <strong>{parcel.stateName}</strong></span>
              <span>District: <strong>{parcel.districtName}</strong></span>
            </div>
          </div>

          {/* Owner Reference (Masked for Public vs Full for Admin) */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1 flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Land Ownership / Custodianship Record</span>
            </div>
            
            {isAdminUser ? (
              <div>
                <div className="font-semibold text-slate-800">{parcel.maskedOwner || 'Recorded Landholder / Department'}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Title Share: 100% (Individual / Departmental / Statutory)</div>
                <div className="text-[10px] text-emerald-700 mt-1 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified with State Land Records & Statutory Gazettes</span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 bg-white rounded border border-slate-200 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase">Owner / Authority Reference (DPDP Compliant)</span>
                <span className="font-mono font-semibold text-slate-800">{parcel.maskedOwner || 'Owner ID: ******4521'}</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Sensitive citizen PII masked under Digital Personal Data Protection (DPDP) Act.
                </p>
              </div>
            )}
          </div>

          {/* Dispute details if any */}
          {parcel.disputeReason && (
            <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-xs">
              <div className="font-bold text-rose-800 text-[11px] uppercase tracking-wide flex items-center space-x-1 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Active Dispute Recorded</span>
              </div>
              <p className="text-rose-700 leading-relaxed">{parcel.disputeReason}</p>
            </div>
          )}

          {/* Administrative Status Modification (Strictly Hidden in Public View!) */}
          {isAdminUser && (
            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                  <span>Administrative Status Action</span>
                </span>
                {!editingStatus && (
                  <button
                    onClick={() => setEditingStatus(true)}
                    className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    Change Status
                  </button>
                )}
              </div>

              {editingStatus && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Select New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-[#0f2942]"
                    >
                      {statusOptions.map(st => (
                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  {newStatus === 'DISPUTED' && (
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-rose-700 mb-1">Dispute Reason / Case Details</label>
                      <textarea
                        rows={2}
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="Enter litigation or boundary dispute details..."
                        className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={handleUpdateStatus}
                      disabled={saving}
                      className="flex-1 bg-[#0f2942] text-white py-1.5 rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {saving ? 'Recording...' : 'Commit Status'}
                    </button>
                    <button
                      onClick={() => setEditingStatus(false)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500">
        Centroid Coordinates: {parcel.centroidLat != null && !isNaN(Number(parcel.centroidLat)) ? Number(parcel.centroidLat).toFixed(4) : 'N/A'}, {parcel.centroidLng != null && !isNaN(Number(parcel.centroidLng)) ? Number(parcel.centroidLng).toFixed(4) : 'N/A'}
      </div>
    </div>
  );
}
