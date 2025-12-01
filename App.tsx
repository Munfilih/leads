import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LeadList } from './components/LeadList';

import { Settings } from './components/Settings';
import { LeadForm } from './components/LeadForm';
import { LeadDetailModal } from './components/LeadDetailModal';
import { LeadEditModal } from './components/LeadEditModal';
import { Notification } from './components/Notification';

import { SettingsProvider } from './contexts/SettingsContext';
import { fetchLeadsFromSheet, saveLeadToSheet, deleteLeadFromSheet, getSheetNames } from './services/sheetService';
import { Lead, LeadStatus, LeadCategory } from './types';
import { RefreshCw } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [placeFilter, setPlaceFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [qualityFilter, setQualityFilter] = useState<string>('');
  const [teamFilter, setTeamFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [hourFilter, setHourFilter] = useState<string>('');
  const [pendingFilter, setPendingFilter] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>('');


  // Auto-switch to dashboard when admin mode is disabled
  React.useEffect(() => {
    if (!isAdminMode && (activeTab === 'form' || activeTab === 'sheets' || activeTab === 'settings')) {
      setActiveTab('dashboard');
    }
  }, [isAdminMode, activeTab]);

  // Load leads and sheet names on mount
  useEffect(() => {
    loadLeads();
    loadSheetNames();
  }, []);



  const loadSheetNames = async () => {
    try {
      const sheets = await getSheetNames();
      console.log('Loaded sheet names:', sheets);
      setSheetNames(sheets);
    } catch (error) {
      console.error('Error loading sheet names:', error);
      setSheetNames(['Sales Team', 'Marketing Team', 'Support Team']);
    }
  };

  const loadLeads = async () => {
    setIsLoading(true);
    const data = await fetchLeadsFromSheet();
    setLeads(data);
    setIsLoading(false);
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    // Update UI immediately
    setLeads(prev => {
      const existing = prev.find(l => l.id === updatedLead.id);
      if (existing) {
        return prev.map(l => l.id === updatedLead.id ? updatedLead : l);
      } else {
        return [...prev, updatedLead];
      }
    });
    
    // Close modals
    setEditingLead(null);
    
    // Save to sheet in background
    const success = await saveLeadToSheet(updatedLead);
    
    if (success) {
      setNotification({ message: 'Lead saved successfully!', type: 'success' });
    } else {
      setNotification({ message: 'Failed to save lead. Please try again.', type: 'error' });
      // Reload data on failure
      loadLeads();
    }
  };

  const handleSaveLeadWithoutClosing = async (updatedLead: Lead) => {
    // Update UI immediately
    setLeads(prev => {
      const existing = prev.find(l => l.id === updatedLead.id);
      if (existing) {
        return prev.map(l => l.id === updatedLead.id ? updatedLead : l);
      } else {
        return [...prev, updatedLead];
      }
    });
    
    // DON'T close modal - keep it open
    
    // Save to sheet in background
    const success = await saveLeadToSheet(updatedLead);
    
    if (success) {
      setNotification({ message: 'Lead saved successfully!', type: 'success' });
    } else {
      setNotification({ message: 'Failed to save lead. Please try again.', type: 'error' });
      // Reload data on failure
      loadLeads();
    }
  };



  const handleDeleteLead = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      // Update UI immediately
      setLeads(prev => prev.filter(l => l.id !== leadId));
      

      
      // Delete from sheet in background
      const success = await deleteLeadFromSheet(lead.uid);
      if (success) {
        setNotification({ message: 'Lead deleted successfully!', type: 'success' });
      } else {
        setNotification({ message: 'Failed to delete lead from sheets', type: 'error' });
        // Reload data on failure
        loadLeads();
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />
      
      <main className="overflow-y-auto relative">
        <div className={activeTab === 'sheets' && isAdminMode ? 'p-0' : 'p-8'}>
          {activeTab === 'leads' && (
            <header className="flex justify-between items-center mb-8">
              <div>
                 <h1 className="text-2xl font-bold text-slate-800">
                  Leads
                </h1>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={loadLeads}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm text-sm font-medium"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  Sync Sheets
                </button>
              </div>
            </header>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'form' && isAdminMode && <LeadForm onSave={handleUpdateLead} leads={leads} />}
              {activeTab === 'dashboard' && (
                <Dashboard 
                  leads={leads} 
                  onFilterByPlace={(place) => {
                    setPlaceFilter(place);
                    setActiveTab('leads');
                  }}
                  onFilterByCountry={(country) => {
                    setCountryFilter(country);
                    setActiveTab('leads');
                  }}
                  onFilterByQuality={(quality) => {
                    setQualityFilter(quality);
                    setActiveTab('leads');
                  }}
                  onFilterByTeam={(team) => {
                    setTeamFilter(team);
                    setActiveTab('leads');
                  }}
                  onFilterByStatus={(status) => {
                    setStatusFilter(status);
                    setActiveTab('leads');
                  }}
                  onFilterByHour={(hour) => {
                    setHourFilter(hour);
                    setActiveTab('leads');
                  }}
                  onFilterByDate={(date) => {
                    setDateFilter(date);
                    setActiveTab('leads');
                  }}
                  onFilterTotal={() => {
                    setPlaceFilter('');
                    setCountryFilter('');
                    setQualityFilter('');
                    setTeamFilter('');
                    setStatusFilter('');
                    setHourFilter('');
                    setPendingFilter(false);
                    setDateFilter('');
                    setActiveTab('leads');
                  }}

                  onFilterPending={() => {
                    setPlaceFilter('');
                    setCountryFilter('');
                    setQualityFilter('');
                    setTeamFilter('');
                    setStatusFilter('');
                    setHourFilter('');
                    setPendingFilter(true);
                    setActiveTab('leads');
                  }}
                  onFilterForwarded={() => {
                    setPlaceFilter('');
                    setCountryFilter('');
                    setQualityFilter('');
                    setTeamFilter('forwarded');
                    setStatusFilter('');
                    setHourFilter('');
                    setActiveTab('leads');
                  }}
                  onFilterRemoved={() => {
                    setPlaceFilter('');
                    setCountryFilter('');
                    setQualityFilter('');
                    setTeamFilter('removed');
                    setStatusFilter('');
                    setHourFilter('');
                    setActiveTab('leads');
                  }} 
                />
              )}
              {activeTab === 'leads' && <LeadList leads={leads} onSelectLead={setSelectedLead} onEditLead={isAdminMode ? setEditingLead : undefined} onDeleteLead={isAdminMode ? handleDeleteLead : undefined} sheetNames={sheetNames} placeFilter={placeFilter} onClearPlaceFilter={() => setPlaceFilter('')} countryFilter={countryFilter} onClearCountryFilter={() => setCountryFilter('')} qualityFilter={qualityFilter} onClearQualityFilter={() => setQualityFilter('')} teamFilter={teamFilter} onClearTeamFilter={() => setTeamFilter('')} statusFilter={statusFilter} onClearStatusFilter={() => setStatusFilter('')} hourFilter={hourFilter} onClearHourFilter={() => setHourFilter('')} pendingFilter={pendingFilter} onClearPendingFilter={() => setPendingFilter(false)} dateFilter={dateFilter} onClearDateFilter={() => setDateFilter('')} editingLead={editingLead} onSaveLead={handleSaveLeadWithoutClosing} onCloseEdit={() => setEditingLead(null)} onNavigateEdit={setEditingLead} />}
              {activeTab === 'settings' && isAdminMode && <Settings />}
              {activeTab === 'sheets' && isAdminMode && (
                <iframe 
                    src="https://docs.google.com/spreadsheets/d/1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA/edit?usp=sharing&widget=true&headers=false&chrome=false&rm=minimal&single=true&gid=0&range=A1:Z1000"
                    className="w-full h-[calc(100vh-80px)] border-0"
                    title="Google Sheet"
                />
              )}
            </>
          )}
        </div>
      </main>
      
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)}
          isAdminMode={isAdminMode}
          onEdit={isAdminMode ? setEditingLead : undefined}
          onDelete={isAdminMode ? handleDeleteLead : undefined}
        />
      )}
      

      
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
};

export default App;
