import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck2,
  GitMerge,
  MapPin,
  Bell,
  Award,
  CircleDollarSign,
  Users,
  Home,
  KeyRound,
  FileText,
  BarChart3,
  AlertTriangle,
  History,
  ShieldAlert,
  Smartphone,
  Info,
  Map,
  Building2,
  Network
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const { user, isPublicUser, isAdminUser } = useAuth();

  // Navigation items for Public Information Portal
  const publicNavItems = [
    { id: 'public-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'public-projects', label: 'Projects', icon: FolderKanban },
    { id: 'public-gis', label: 'GIS Map', icon: MapPin },
    { id: 'public-states', label: 'States', icon: Map },
    { id: 'public-districts', label: 'Districts', icon: Building2 },
    { id: 'public-notifications', label: 'Notifications', icon: Bell },
    { id: 'public-reports', label: 'Reports', icon: BarChart3 },
    { id: 'public-integrations', label: 'Govt Adapters', icon: Network },
    { id: 'public-about', label: 'About BHOOMI CHITRA', icon: Info }
  ];

  // Navigation items for Administrative Control Center
  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-projects', label: 'Projects', icon: FolderKanban },
    { id: 'admin-proposals', label: 'Proposals', icon: FileCheck2 },
    { id: 'admin-workflow', label: 'Workflow', icon: GitMerge },
    { id: 'admin-gis', label: 'GIS / Parcels', icon: MapPin },
    { id: 'admin-notifications', label: 'Notifications', icon: Bell },
    { id: 'admin-awards', label: 'Awards', icon: Award },
    { id: 'admin-compensation', label: 'Compensation', icon: CircleDollarSign },
    { id: 'admin-families', label: 'Affected Families', icon: Users },
    { id: 'admin-rr', label: 'R&R', icon: Home },
    { id: 'admin-possession', label: 'Possession', icon: KeyRound },
    { id: 'admin-documents', label: 'Documents', icon: FileText },
    { id: 'admin-reports', label: 'MIS Reports', icon: BarChart3 },
    { id: 'admin-risk', label: 'Risk Analytics', icon: AlertTriangle },
    { id: 'admin-audit', label: 'Audit Logs', icon: History }
  ];

  // Additional admin items
  if (user && user.roleCode === 'SYS_ADMIN') {
    adminNavItems.push({ id: 'admin-users', label: 'User Management', icon: ShieldAlert });
  }

  // Field Officer shortcut
  if (user && (user.roleCode === 'FIELD_OFFICER' || user.roleCode === 'SYS_ADMIN' || user.roleCode === 'DISTRICT_AUTHORITY')) {
    adminNavItems.push({ id: 'field-officer', label: 'Field Mobile Mode', icon: Smartphone });
  }

  const items = isAdminUser ? adminNavItems : publicNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-80px)] flex flex-col justify-between shrink-0">
      <div className="p-3">
        {/* Portal Mode Banner */}
        <div className={`mb-3 p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${
          isAdminUser ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <span>{isAdminUser ? 'ADMINISTRATIVE PORTAL' : 'PUBLIC CITIZEN PORTAL'}</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>

        {/* Navigation Link List */}
        <nav className="space-y-0.5">
          {items.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0f2942] text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer information inside sidebar */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-500">
        <div className="font-semibold text-slate-700">NIC GIS Platform V1.0</div>
        <div>RFCTLARR 2013 & NH 1956 Compliant</div>
        <div className="mt-1 text-slate-400">Secure 256-bit Encrypted Session</div>
      </div>
    </aside>
  );
}
