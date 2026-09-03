import React from 'react';
import { Bell, FileText, Calendar, Download } from 'lucide-react';

export default function PublicNotifications() {
  const publicNotices = [
    {
      id: 1,
      title: 'Gazette of India: Section 3A Preliminary Notification for NH-55 4-Laning (Dhenkanal Section)',
      ref: 'S.O. 1842(E)',
      date: '2025-06-02',
      authority: 'Ministry of Road Transport & Highways (MoRTH)',
      desc: 'Declaration of intention to acquire land across 14 revenue villages in Dhenkanal Sadar Tehsil for 4-laning corridor expansion.',
      doc: 'Gazette_Notification_Sec3A.pdf'
    },
    {
      id: 2,
      title: 'CALA Land Acquisition Award Order Declared under Section 3G (Award No. 42/2025)',
      ref: 'CALA/DHK/2025/42',
      date: '2025-11-10',
      authority: 'Competent Authority Land Acquisition (CALA) Dhenkanal',
      desc: 'Determination of market value with 100% Solatium and 12% additional market value for 75 parcels in Gondia and Joranda villages.',
      doc: 'CALA_Award_Order_42_2025.pdf'
    },
    {
      id: 3,
      title: 'Section 11 Preliminary Notification: Pune Outer Ring Road Expressway Package 2',
      ref: 'MSRDC/LA/2025/11',
      date: '2025-08-14',
      authority: 'MSRDC / Collector Pune',
      desc: 'Notification inviting objections under Section 15 of RFCTLARR Act 2013 for western ring alignment.',
      doc: 'Pune_RingRoad_Sec11.pdf'
    },
    {
      id: 4,
      title: 'Public Notice: Schedule of Joint Measurement Survey (JMS) in Village Kapilash Road',
      ref: 'JMS/DHK/2025/88',
      date: '2025-07-20',
      authority: 'Special Land Acquisition Officer, Dhenkanal',
      desc: 'Intimation to all recorded raiyats and interested persons to remain present with land records during field boundary pegging.',
      doc: 'JMS_Notice_Kapilash.pdf'
    }
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Statutory Public Notices & Gazette Notifications</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Official gazetted notifications under National Highways Act 1956 and RFCTLARR Act 2013 for citizen awareness and statutory compliance.
        </p>
      </div>

      <div className="space-y-3">
        {publicNotices.map(n => (
          <div key={n.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {n.ref}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{n.title}</h3>
                <div className="flex items-center space-x-3 text-slate-500 text-[11px] mt-1">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gazetted: {n.date}</span>
                  </span>
                  <span>Authority: <strong>{n.authority}</strong></span>
                </div>
              </div>

              <button className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl flex items-center space-x-1.5 transition-colors shrink-0">
                <Download className="w-3.5 h-3.5" />
                <span>Download Gazette</span>
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {n.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
