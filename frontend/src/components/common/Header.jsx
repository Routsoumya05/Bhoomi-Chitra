import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Bell,
  LogOut,
  User,
  Shield,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Header({ currentView, setCurrentView, onOpenLoginModal }) {
  const { user, isPublicUser, isAdminUser, logout, loginAsPublic } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [fontSize, setFontSize] = useState('normal'); // 'sm', 'normal', 'lg'

  const roleLabels = {
    'SYS_ADMIN': 'System Administrator',
    'CENTRAL_MINISTRY': 'Central Ministry (MoRTH)',
    'STATE_GOVT': 'State Government (Odisha)',
    'DISTRICT_AUTHORITY': 'District Authority (CALA Dhenkanal)',
    'PIA': 'Project Implementing Agency (NHAI)',
    'FIELD_OFFICER': 'Field Verification Officer',
    'PUBLIC_USER': 'Public Citizen'
  };

  const roleBadgeColors = {
    'SYS_ADMIN': 'bg-purple-100 text-purple-800 border-purple-300',
    'CENTRAL_MINISTRY': 'bg-blue-100 text-blue-800 border-blue-300',
    'STATE_GOVT': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'DISTRICT_AUTHORITY': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'PIA': 'bg-amber-100 text-amber-800 border-amber-300',
    'FIELD_OFFICER': 'bg-teal-100 text-teal-800 border-teal-300',
    'PUBLIC_USER': 'bg-slate-100 text-slate-700 border-slate-300'
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      {/* Top Tricolor Strip */}
      <div className="gov-tricolor-bar"></div>

      {/* Official Government Top Bar */}
      <div className="bg-[#0f2942] text-white text-xs px-4 py-1.5 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-amber-400">भारत सरकार | Government of India</span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">Department of Land Resources (DoLR), Ministry of Rural Development</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-[11px] text-slate-300">
            <span>Font Size:</span>
            <button onClick={() => setFontSize('sm')} className="px-1 hover:text-white font-mono">A-</button>
            <button onClick={() => setFontSize('normal')} className="px-1 hover:text-white font-mono">A</button>
            <button onClick={() => setFontSize('lg')} className="px-1 hover:text-white font-mono">A+</button>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-amber-300 font-medium">EN / हिन्दी</span>
        </div>
      </div>

      {/* Main Brand & Navigation Banner */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView(isAdminUser ? 'admin-dashboard' : 'landing')}>
          {/* Logo Crest */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0f2942] to-[#1e3a8a] p-1 flex items-center justify-center shadow-md border border-amber-500/40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke="#f59e0b" strokeWidth="6" />
              <path d="M50 22 L75 36 L75 64 L50 78 L25 64 L25 36 Z" fill="#15803d" opacity="0.85" />
              <line x1="50" y1="22" x2="50" y2="78" stroke="#ffffff" strokeWidth="3" />
              <line x1="25" y1="50" x2="75" y2="50" stroke="#ffffff" strokeWidth="3" />
              <circle cx="50" cy="50" r="8" fill="#f59e0b" />
            </svg>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-tight text-[#0f2942]">BHOOMI CHITRA</h1>
              {isAdminUser ? (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">
                  Administrative Control Center
                </span>
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                  Public Information Portal
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide">
              National Land Acquisition & Management System • One Platform. Every Parcel.
            </p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                <div className="bg-[#0f2942] text-white px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-sm">Notifications & Alerts</span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-amber-300 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-amber-50/50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-semibold text-slate-800">{n.title}</span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 mt-1"></span>
                          )}
                        </div>
                        <p className="text-slate-600 mt-1 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.category}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Session Info */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${roleBadgeColors[user.roleCode] || 'bg-slate-100 text-slate-700'}`}>
                    {roleLabels[user.roleCode] || user.roleCode}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={loginAsPublic}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Public Access
              </button>
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0f2942] hover:bg-slate-800 shadow transition-colors flex items-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
