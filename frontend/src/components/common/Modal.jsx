import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full ${maxWidth} z-10 overflow-hidden transform transition-all`}>
        {/* Modal Header */}
        <div className="bg-[#0f2942] text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
