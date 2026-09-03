import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Footer from './components/common/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Public Pages
import PublicDashboard from './pages/public/PublicDashboard';
import PublicProjects from './pages/public/PublicProjects';
import PublicProjectDetail from './pages/public/PublicProjectDetail';
import PublicGisPage from './pages/public/PublicGisPage';
import PublicStates from './pages/public/PublicStates';
import PublicDistricts from './pages/public/PublicDistricts';
import PublicNotifications from './pages/public/PublicNotifications';
import PublicReports from './pages/public/PublicReports';
import PublicIntegrations from './pages/public/PublicIntegrations';
import PublicAbout from './pages/public/PublicAbout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProjectList from './pages/admin/ProjectList';
import ProjectDetail from './pages/admin/ProjectDetail';
import ProposalList from './pages/admin/ProposalList';
import AdminGisPage from './pages/admin/AdminGisPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import FieldOfficerMobile from './pages/field/FieldOfficerMobile';

import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';

export default function App() {
  const { user, isPublicUser, isAdminUser, loginAsPublic } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projectInitialTab, setProjectInitialTab] = useState('overview');

  // Shared Global Data States
  const [kpis, setKpis] = useState(null);
  const [projects, setProjects] = useState([]);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch National Aggregate Data
  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const [kpiRes, projRes, geoRes] = await Promise.all([
        api.getNationalKpis(),
        api.getProjects(),
        api.getGeoJson()
      ]);

      if (kpiRes.success) setKpis(kpiRes.kpis);
      if (projRes.success) setProjects(projRes.data);
      if (geoRes.type === 'FeatureCollection') setGeoJsonData(geoRes);
    } catch (err) {
      console.error('Failed to fetch initial global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, [user]);

  // Adjust view if user logs in as admin
  useEffect(() => {
    if (isAdminUser && (currentView === 'landing' || currentView === 'login')) {
      setCurrentView('admin-dashboard');
    }
  }, [user, isAdminUser]);

  // Navigation Helpers
  const handleOpenPublicPortal = async () => {
    try {
      if (!user) {
        await loginAsPublic();
      }
      setCurrentView('public-dashboard');
    } catch (e) {
      setCurrentView('public-dashboard');
    }
  };

  const handleOpenAdminLogin = () => {
    setCurrentView('login');
  };

  const handleSelectProject = (id, tab = 'overview') => {
    setSelectedProjectId(id);
    setProjectInitialTab(tab);
    if (isAdminUser) {
      setCurrentView('admin-project-detail');
    } else {
      setCurrentView('public-project-detail');
    }
  };

  const handleSelectFlagship = () => {
    const flagship = projects.find(p => p.project_code?.includes('NH55')) || projects[0];
    if (flagship) {
      handleSelectProject(flagship.id, 'overview');
    }
  };

  // Render Dedicated Field Officer Mobile View
  if (currentView === 'field-officer') {
    return (
      <FieldOfficerMobile
        onBack={() => setCurrentView(isAdminUser ? 'admin-dashboard' : 'landing')}
      />
    );
  }

  // Render Full Landing Page without Sidebar
  if (currentView === 'landing' && !isAdminUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenLoginModal={handleOpenAdminLogin}
        />
        <LandingPage
          kpis={kpis}
          onOpenPublicPortal={handleOpenPublicPortal}
          onOpenAdminLogin={handleOpenAdminLogin}
          onSelectFlagshipProject={handleSelectFlagship}
        />
        <Footer />
      </div>
    );
  }

  // Render Login Page without Sidebar
  if (currentView === 'login') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-slate-100">
        <Header
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenLoginModal={handleOpenAdminLogin}
        />
        <div className="py-10">
          <LoginPage
            onLoginSuccess={() => setCurrentView('admin-dashboard')}
            onSwitchToPublic={handleOpenPublicPortal}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLoginModal={handleOpenAdminLogin}
      />

      {/* Main Body with Sidebar and Content */}
      <div className="flex flex-1 w-full max-w-[1700px] mx-auto">
        <Sidebar
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-full">
          {/* ================= PUBLIC PORTAL VIEWS ================= */}
          {currentView === 'public-dashboard' && (
            <PublicDashboard
              kpis={kpis}
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigateGis={() => setCurrentView('public-gis')}
            />
          )}

          {currentView === 'public-projects' && (
            <PublicProjects
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {currentView === 'public-project-detail' && (
            <PublicProjectDetail
              projectId={selectedProjectId}
              onBack={() => setCurrentView('public-projects')}
            />
          )}

          {currentView === 'public-gis' && (
            <PublicGisPage
              geoJsonData={geoJsonData}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onRefresh={fetchGlobalData}
            />
          )}

          {currentView === 'public-states' && (
            <PublicStates onSelectState={() => {}} />
          )}

          {currentView === 'public-districts' && (
            <PublicDistricts />
          )}

          {currentView === 'public-notifications' && (
            <PublicNotifications />
          )}

          {currentView === 'public-reports' && (
            <PublicReports />
          )}

          {currentView === 'public-integrations' && (
            <PublicIntegrations />
          )}

          {currentView === 'public-about' && (
            <PublicAbout />
          )}

          {/* ================= ADMINISTRATIVE CONTROL CENTER VIEWS ================= */}
          {currentView === 'admin-dashboard' && (
            <AdminDashboard
              kpis={kpis}
              projects={projects}
              onSelectProject={handleSelectProject}
              onNavigateView={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'admin-projects' && (
            <ProjectList
              projects={projects}
              onSelectProject={handleSelectProject}
              onRefreshProjects={fetchGlobalData}
            />
          )}

          {currentView === 'admin-project-detail' && (
            <ProjectDetail
              projectId={selectedProjectId}
              initialTab={projectInitialTab}
              onBack={() => setCurrentView('admin-projects')}
            />
          )}

          {currentView === 'admin-proposals' && (
            <ProposalList
              projects={projects}
              onSelectProject={handleSelectProject}
            />
          )}

          {currentView === 'admin-workflow' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="workflow"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-gis' && (
            <AdminGisPage
              geoJsonData={geoJsonData}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onRefresh={fetchGlobalData}
            />
          )}

          {currentView === 'admin-awards' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="compensation"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-compensation' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="compensation"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-families' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="families"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-rr' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="rr"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-possession' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="possession"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-documents' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="documents"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-notifications' && (
            <PublicNotifications />
          )}

          {currentView === 'admin-reports' && (
            <PublicReports />
          )}

          {currentView === 'admin-risk' && (
            <ProjectDetail
              projectId={selectedProjectId || projects[0]?.id}
              initialTab="risk"
              onBack={() => setCurrentView('admin-dashboard')}
            />
          )}

          {currentView === 'admin-audit' && (
            <AuditLogsPage />
          )}

          {currentView === 'admin-users' && (
            <UserManagementPage />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
