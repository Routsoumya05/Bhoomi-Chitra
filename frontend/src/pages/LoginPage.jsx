import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Shield,
  KeyRound,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Lock,
  Building,
  Users
} from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onSwitchToPublic }) {
  const { login, loginAsPublic } = useAuth();
  const [email, setEmail] = useState('district@bhoomichitra.demo');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const demoAccounts = [
    {
      role: 'District Authority (CALA)',
      email: 'district@bhoomichitra.demo',
      name: 'Shri Somesh Upadhyay, IAS',
      desc: 'Collectorate & CALA Dhenkanal, Odisha (Flagship Corridor)',
      color: 'border-emerald-300 bg-emerald-50 text-emerald-800'
    },
    {
      role: 'Central Ministry',
      email: 'central@bhoomichitra.demo',
      name: 'Smt. Anita Sundaram, IAS',
      desc: 'Ministry of Road Transport & Highways (MoRTH)',
      color: 'border-blue-300 bg-blue-50 text-blue-800'
    },
    {
      role: 'State Government',
      email: 'state@bhoomichitra.demo',
      name: 'Shri Manoj Kumar Mishra, IAS',
      desc: 'Revenue & Disaster Management Dept, Govt of Odisha',
      color: 'border-indigo-300 bg-indigo-50 text-indigo-800'
    },
    {
      role: 'Implementing Agency (PIA)',
      email: 'pia@bhoomichitra.demo',
      name: 'Er. Pradeep Satapathy',
      desc: 'National Highways Authority of India (NHAI PIU)',
      color: 'border-amber-300 bg-amber-50 text-amber-800'
    },
    {
      role: 'Field Officer',
      email: 'field@bhoomichitra.demo',
      name: 'Bipin Bihari Rout',
      desc: 'Revenue Inspector / Joint Measurement Survey Team',
      color: 'border-teal-300 bg-teal-50 text-teal-800'
    },
    {
      role: 'System Administrator',
      email: 'admin@bhoomichitra.demo',
      name: 'Dr. Rajesh Verma, IAS',
      desc: 'Department of Land Resources (DoLR), MoRD',
      color: 'border-purple-300 bg-purple-50 text-purple-800'
    }
  ];

  const handleManualLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    try {
      setLoading(true);
      setError(null);
      await login(demoEmail, 'Demo@1234');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Failed to login with demo credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-slate-800">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#0f2942] text-white p-6 text-center border-b border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center mx-auto mb-3 font-bold shadow-lg">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Administrative Authentication</h2>
          <p className="text-xs text-slate-300 mt-1">
            Authorized Official Gateway for Central, State, District & Project Authorities
          </p>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Manual Login Form */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Sign In with Credentials</span>
            </h3>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Official Email ID
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@bhoomichitra.demo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#0f2942]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-[#0f2942]"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Demo evaluation password: <strong className="text-slate-700 font-mono">Demo@1234</strong>
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#0f2942] text-white rounded-xl font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Official...' : 'Sign In to Control Center'}</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onSwitchToPublic}
                  className="text-xs text-blue-700 font-semibold hover:underline inline-flex items-center space-x-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Looking for Public Land Records? Switch to Public Portal</span>
                </button>
              </div>
            </form>
          </div>

          {/* Column 2: 1-Click Demo Roles (For SIH Demonstration) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>1-Click Evaluator Switcher</span>
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                SIH DEMO MODE
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Click any administrative role below to instantly log in as that designated official:
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {demoAccounts.map(demo => (
                <div
                  key={demo.email}
                  onClick={() => handleSelectDemo(demo.email)}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-all hover:border-[#0f2942] flex items-center justify-between group text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${demo.color}`}>
                        {demo.role}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 mt-1">{demo.name}</div>
                    <div className="text-[11px] text-slate-500">{demo.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0f2942] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
