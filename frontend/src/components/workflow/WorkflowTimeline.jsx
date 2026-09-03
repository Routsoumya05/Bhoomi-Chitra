import React, { useState } from 'react';
import Badge from '../common/Badge';
import WorkflowActionModal from './WorkflowActionModal';
import { useAuth } from '../../contexts/AuthContext';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  RotateCcw,
  ArrowDown,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';

export default function WorkflowTimeline({
  workflowData,
  projectId,
  onWorkflowUpdated
}) {
  const { isAdminUser, user } = useAuth();
  const [activeModalStep, setActiveModalStep] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState({});

  if (!workflowData || !workflowData.steps) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        Loading project acquisition workflow...
      </div>
    );
  }

  const steps = workflowData.steps;

  const toggleHistory = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-rose-600" />;
      case 'RETURNED':
        return <RotateCcw className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f2942] text-white p-5 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base tracking-tight flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <span>Statutory Land Acquisition Lifecycle (13 Stages)</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Compliant with RFCTLARR Act 2013 & National Highways Act 1956
          </p>
        </div>
        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px] uppercase font-semibold">Current Active Stage</span>
          <span className="font-bold text-amber-300">{workflowData.instance?.current_stage}</span>
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="p-6">
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-6">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';
            const history = Array.isArray(step.action_history) ? step.action_history : [];

            return (
              <div key={step.id} className="relative pl-6 md:pl-8 group">
                {/* Status Dot */}
                <div className={`absolute -left-[13px] top-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center border-2 ${
                  isCompleted ? 'border-emerald-600' : (isInProgress ? 'border-blue-600 ring-4 ring-blue-100' : 'border-slate-300')
                }`}>
                  {getStepIcon(step.status)}
                </div>

                {/* Step Card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  isInProgress
                    ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                    : (isCompleted ? 'bg-slate-50/70 border-slate-200' : 'bg-white border-slate-100 opacity-80')
                }`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-slate-400">Step {idx + 1}</span>
                        <h4 className="font-bold text-sm text-slate-900">{step.stage_name}</h4>
                        <Badge status={step.status} size="xs" />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Authority: <strong>{step.assigned_authority || 'Competent Authority'}</strong></span>
                        </span>
                        {step.due_date && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Target: {step.due_date}</span>
                          </span>
                        )}
                        {step.completed_date && (
                          <span className="text-emerald-700 font-semibold">
                            Completed: {step.completed_date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Execution Button (Admin Only, for Active / In-progress Step) */}
                    {isAdminUser && isInProgress && (
                      <button
                        onClick={() => setActiveModalStep(step)}
                        className="px-3.5 py-1.5 bg-[#0f2942] text-white hover:bg-slate-800 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <span>Take Statutory Action</span>
                      </button>
                    )}
                  </div>

                  {/* Remarks & Action Taken */}
                  {step.action_taken && (
                    <div className="mt-3 p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <div className="font-semibold text-slate-700">Official Decision: {step.action_taken}</div>
                      {step.remarks && <p className="text-slate-600 mt-0.5">{step.remarks}</p>}
                    </div>
                  )}

                  {/* History Toggle */}
                  {history.length > 0 && (
                    <div className="mt-2 text-right">
                      <button
                        onClick={() => toggleHistory(step.id)}
                        className="text-[11px] font-semibold text-blue-700 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>{history.length} Action Event(s) Recorded</span>
                        {expandedHistory[step.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {expandedHistory[step.id] && (
                        <div className="mt-2 p-3 bg-slate-100 rounded-lg text-left text-xs space-y-2 border border-slate-200">
                          {history.map((h, hIdx) => (
                            <div key={hIdx} className="border-b border-slate-200 pb-1.5 last:border-0 last:pb-0">
                              <div className="flex justify-between font-semibold text-slate-800">
                                <span>{h.action} by {h.performedBy} ({h.role})</span>
                                <span className="text-[10px] text-slate-500">{new Date(h.timestamp).toLocaleString()}</span>
                              </div>
                              {h.remarks && <p className="text-slate-600 text-[11px] mt-0.5">{h.remarks}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Dialog */}
      {activeModalStep && (
        <WorkflowActionModal
          isOpen={!!activeModalStep}
          onClose={() => setActiveModalStep(null)}
          step={activeModalStep}
          projectId={projectId}
          onActionComplete={() => {
            if (onWorkflowUpdated) onWorkflowUpdated();
          }}
        />
      )}
    </div>
  );
}
