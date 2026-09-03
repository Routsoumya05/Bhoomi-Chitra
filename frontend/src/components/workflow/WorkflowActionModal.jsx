import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export default function WorkflowActionModal({
  isOpen,
  onClose,
  step,
  projectId,
  onActionComplete
}) {
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState('Approve');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!step) return null;

  // Available action options depending on stage
  const actionOptions = [
    { label: 'Approve Stage', value: 'Approve', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Verify & Forward', value: 'Forward', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Return for Correction', value: 'Return for Correction', color: 'bg-amber-600 hover:bg-amber-700' },
    { label: 'Reject Proposal', value: 'Reject', color: 'bg-rose-600 hover:bg-rose-700' },
    { label: 'Mark Stage Completed', value: 'Complete', color: 'bg-teal-600 hover:bg-teal-700' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const res = await api.performWorkflowAction({
        projectId,
        stepId: step.id,
        action: selectedAction,
        remarks: remarks || `Executed ${selectedAction} by ${user.fullName} (${user.roleCode})`
      });

      if (res.success) {
        if (onActionComplete) onActionComplete(res);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to perform workflow action');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Workflow Action: ${step.stage_name}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Current Stage:</span>
            <span className="font-bold text-slate-800">{step.stage_name}</span>
          </div>
          <div className="flex justify-between text-slate-600 mt-1">
            <span>Assigned Authority:</span>
            <span className="font-semibold text-[#0f2942]">{step.assigned_authority || 'Competent Authority'}</span>
          </div>
          <div className="flex justify-between text-slate-600 mt-1">
            <span>Current Officer:</span>
            <span className="font-semibold text-slate-800">{user?.fullName} ({user?.roleCode})</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Select Statutory Decision
          </label>
          <div className="grid grid-cols-2 gap-2">
            {actionOptions.map(opt => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setSelectedAction(opt.value)}
                className={`p-2.5 rounded-lg font-semibold text-xs border text-left transition-all ${
                  selectedAction === opt.value
                    ? 'border-[#0f2942] bg-slate-100 text-[#0f2942] ring-2 ring-[#0f2942]/20 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1.5">
            Official Endorsement Remarks / Order Reference
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter statutory notes, order number, verification findings, or grounds for action..."
            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#0f2942]"
            required
          />
        </div>

        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
          <span className="font-bold">Legal Notice:</span> This action is cryptographically signed with your active official session and permanently committed to the immutable BHOOMI CHITRA National Audit Trail.
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#0f2942] text-white py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'Processing Order...' : 'Execute Statutory Decision'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
