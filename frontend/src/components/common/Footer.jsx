import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0f2942] text-white border-t border-slate-700 mt-auto">
      {/* Tricolor line */}
      <div className="gov-tricolor-bar"></div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-300">
          <div>
            <h4 className="font-bold text-sm text-white mb-2 flex items-center space-x-2">
              <span className="text-amber-400">BHOOMI CHITRA</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              National Land Acquisition & Management System. Connected Governance, Transparent Lifecycle, GIS-Driven Spatial Intelligence.
            </p>
            <p className="mt-3 text-[11px] text-amber-300/80">
              Department of Land Resources (DoLR)<br />
              Ministry of Rural Development, Govt of India
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-2">Legal & Statutory Framework</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• RFCTLARR Act, 2013 (Fair Compensation)</li>
              <li>• National Highways Act, 1956 (Sec 3A - 3J)</li>
              <li>• Railways Act, 1989 (Special Railway Projects)</li>
              <li>• PM Gati Shakti National Master Plan (NMP)</li>
              <li>• Digital India Land Records Modernization (DILRMP)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-2">Connected Portals & Adapters</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Bhulekh / Bhoomi State Land Records</li>
              <li>• NIC BhuNaksha Cadastral Mapping Service</li>
              <li>• Public Financial Management System (PFMS)</li>
              <li>• PARIVESH Environmental & Forest Clearances</li>
              <li>• Gati Shakti Sanchar GIS Platform</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-white mb-2">National Helpdesk & Support</h4>
            <div className="space-y-1 text-slate-400">
              <div>Toll Free Helpline: <span className="text-white font-semibold">1800-11-2026</span></div>
              <div>Support Email: <span className="text-amber-400">helpdesk@bhoomichitra.gov.in</span></div>
              <div>Working Hours: 09:30 AM – 06:00 PM (IST)</div>
              <div className="mt-3 pt-2 border-t border-slate-700 text-[10px] text-slate-500">
                Designed & Hosted by National Informatics Centre (NIC)
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Government of India. All Rights Reserved. Content Owned by Department of Land Resources.
          </div>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Hyperlinking Policy</span>
            <span className="hover:text-white cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
