import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SettingsContextType {
  leadQualities: string[];
  businessIndustries: string[];
  setLeadQualities: (qualities: string[]) => void;
  setBusinessIndustries: (industries: string[]) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [leadQualities, setLeadQualities] = useState(['HOT', 'WARM', 'COLD', 'FAKE', 'UNCATEGORIZED']);
  const [businessIndustries, setBusinessIndustries] = useState(['Real Estate', 'Technology', 'Healthcare', 'Finance', 'Education']);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzY1EHbwCWyH3URSlu0U_U8Ocs_uHSo9oIL-6tylI8qDmCji6VAB9OnEw80Cug1Zm0i/exec';
      const formData = new FormData();
      formData.append('action', 'getSettings');
      
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const settings = await response.json();
        setLeadQualities(settings.leadQualities);
        setBusinessIndustries(settings.businessIndustries);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (qualities: string[], industries: string[]) => {
    try {
      const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzY1EHbwCWyH3URSlu0U_U8Ocs_uHSo9oIL-6tylI8qDmCji6VAB9OnEw80Cug1Zm0i/exec';
      const formData = new FormData();
      formData.append('action', 'saveSettings');
      formData.append('leadQualities', JSON.stringify(qualities));
      formData.append('businessIndustries', JSON.stringify(industries));
      
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateLeadQualities = (qualities: string[]) => {
    setLeadQualities(qualities);
    saveSettings(qualities, businessIndustries);
  };

  const updateBusinessIndustries = (industries: string[]) => {
    setBusinessIndustries(industries);
    saveSettings(leadQualities, industries);
  };

  return (
    <SettingsContext.Provider value={{
      leadQualities,
      businessIndustries,
      setLeadQualities: updateLeadQualities,
      setBusinessIndustries: updateBusinessIndustries
    }}>
      {children}
    </SettingsContext.Provider>
  );
};