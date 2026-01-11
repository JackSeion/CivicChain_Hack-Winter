import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewPageEnhanced } from './components/OverviewPageEnhanced';
import { DepartmentsPage } from './components/DepartmentsPage';
import { StatsPageEnhanced } from './components/StatsPageEnhanced';
import { PerformancePage } from './components/PerformancePage';
import { ReportsPage } from './components/ReportsPage';
import { HelpPage } from './components/HelpPage';
import { AIInsightsPage } from './components/AIInsightsPage';
import { MunicipalCommunicationChat } from './components/MunicipalCommunicationChat';
import { StateOverviewPageEnhanced } from '@/components/StateOverviewPageEnhanced';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import * as api from './utils/api';

interface Complaint {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  votes: number;
  submittedDate: string;
  status: 'pending' | 'resolved' | 'verified';
  photo: string;
  resolutionImage?: string;
  resolutionImages?: string[];
  resolvedDate?: string;
  verificationCount?: number;
  daysPending?: number;
  resolvedByOfficer?: string;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'municipal' | 'state' | null>(null);
  const [currentPage, setCurrentPage] = useState('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [municipalId, setMunicipalId] = useState<string>('');
  const [municipalName, setMunicipalName] = useState<string>('');
  const [stateId, setStateId] = useState<string>('');
  const [stateName, setStateName] = useState<string>('');

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedMunicipalId = localStorage.getItem('municipalId');
    const savedMunicipalName = localStorage.getItem('municipalName');
    const savedStateId = localStorage.getItem('stateId');
    const savedStateName = localStorage.getItem('stateName');
    const savedCurrentPage = localStorage.getItem('currentPage');
    const savedUserType = localStorage.getItem('userType') as 'municipal' | 'state' | null;

    // Restore state dashboard session
    if (savedUserType === 'state' && savedStateId && savedStateName) {
      setUserType('state');
      setIsLoggedIn(true);
      setStateId(savedStateId);
      setStateName(savedStateName);
      setCurrentPage(savedCurrentPage || 'state-overview');
      return;
    }

    // Restore municipal dashboard session (also fallback for older localStorage without userType)
    if ((savedUserType === 'municipal' || !savedUserType) && savedMunicipalId && savedMunicipalName) {
      setUserType('municipal');
      setIsLoggedIn(true);
      setMunicipalId(savedMunicipalId);
      setMunicipalName(savedMunicipalName);
      if (savedStateId && savedStateName) {
        setStateId(savedStateId);
        setStateName(savedStateName);
      }
      if (savedCurrentPage) {
        setCurrentPage(savedCurrentPage);
      }
    }
  }, []);

  // Load complaints when logged in
  useEffect(() => {
    if (isLoggedIn && userType === 'municipal' && municipalId) {
      loadComplaints();
    }
  }, [isLoggedIn, municipalId, userType]);

  // Save current page to localStorage whenever it changes
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage, isLoggedIn]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await api.getComplaintsByMunicipal(municipalId);
      setComplaints(data as any);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast.error('Failed to load complaints', {
        description: 'Please try refreshing the page',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMunicipalLogin = (municipalId: string, municipalName: string, selectedStateId: string, selectedStateName: string) => {
    setIsLoggedIn(true);
    setUserType('municipal');
    setMunicipalId(municipalId);
    setMunicipalName(municipalName);
    setStateId(selectedStateId);
    setStateName(selectedStateName);
    setCurrentPage('overview');

    localStorage.setItem('userType', 'municipal');
    localStorage.setItem('municipalId', municipalId);
    localStorage.setItem('municipalName', municipalName);
    localStorage.setItem('stateId', selectedStateId);
    localStorage.setItem('stateName', selectedStateName);
    localStorage.setItem('currentPage', 'overview');

    toast.success(`Successfully logged in to ${municipalName}`);
  };

  const handleStateLogin = (stateId: string, stateName: string) => {
    setIsLoggedIn(true);
    setUserType('state');
    setStateId(stateId);
    setStateName(stateName);
    setCurrentPage('state-overview');

    localStorage.setItem('userType', 'state');
    localStorage.setItem('stateId', stateId);
    localStorage.setItem('stateName', stateName);
    localStorage.setItem('currentPage', 'state-overview');

    toast.success(`Welcome to ${stateName} state dashboard`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentPage('overview');
    setMunicipalId('');
    setMunicipalName('');
    setStateId('');
    setStateName('');
    setComplaints([]);

    localStorage.removeItem('userType');
    localStorage.removeItem('municipalId');
    localStorage.removeItem('municipalName');
    localStorage.removeItem('stateId');
    localStorage.removeItem('stateName');
    localStorage.removeItem('currentPage');

    toast.info('Logged out successfully');
  };

  const handleResolve = async (id: number, imageUrl: string) => {
    try {
      await api.resolveComplaint(id, imageUrl);
      const now = new Date().toISOString();
      setComplaints(prev => 
        prev.map(complaint => 
          complaint.id === id 
            ? { 
                ...complaint, 
                status: 'resolved' as const,
                resolutionImage: imageUrl,
                resolutionImages: [imageUrl],
                resolvedDate: now,
              }
            : complaint
        )
      );
      toast.success('Complaint resolved successfully', {
        description: 'The complaint has been marked as resolved with verification photo.',
      });
      
      // Reload complaints to get fresh data from database
      setTimeout(() => {
        loadComplaints();
      }, 1000);
    } catch (error) {
      console.error('Error resolving complaint:', error);
      toast.error('Failed to resolve complaint', {
        description: 'Please try again',
      });
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onMunicipalLogin={handleMunicipalLogin} onStateLogin={handleStateLogin} />;
  }

  const renderMunicipalPage = () => {
    // Show all pages for municipal login
    switch (currentPage) {
      case 'overview':
        return <OverviewPageEnhanced complaints={complaints} loading={loading} />;
      case 'departments':
        return (
          <DepartmentsPage
            complaints={complaints}
            onResolve={handleResolve}
            loading={loading}
          />
        );
      case 'stats':
        return <StatsPageEnhanced municipalId={municipalId} />;
      case 'ai-insights':
        return <AIInsightsPage municipalId={municipalId} />;
      case 'performance':
        return <PerformancePage municipalId={municipalId} />;
      case 'reports':
        return <ReportsPage complaints={complaints} loading={loading} municipalName={municipalName} />;
      case 'help':
        return <HelpPage />;
      default:
        return <OverviewPageEnhanced complaints={complaints} loading={loading} />;
    }
  };

  if (userType === 'state') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500">State Dashboard</p>
              <h2 className="text-2xl text-gray-900">{stateName}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100">{stateId}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                Logout
              </button>
            </div>
          </header>

          <StateOverviewPageEnhanced stateId={stateId} stateName={stateName} />
        </div>

        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <>
      <DashboardLayout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        municipalName={municipalName}
      >
        {renderMunicipalPage()}
      </DashboardLayout>
      
      {/* Municipal Communication Chat */}
      {municipalId && stateId && (
        <MunicipalCommunicationChat
          stateId={stateId}
          stateName={stateName}
          municipalId={municipalId}
          municipalName={municipalName}
        />
      )}
      
      <Toaster position="top-right" />
    </>
  );
}