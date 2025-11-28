import { Lead, LeadStatus, LeadCategory } from '../types';

// The ID from the user's provided URL
const SHEET_ID = '1J-XAPbm9FaY5YdcI8id6g0EfgKzmp4xJzMJ7VdPLZaA';
const GID = '0';
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vRpuMDxiaD0SePklhURvKEIKSbW5iDqH3vl9Ev7gnD8J3wKqvJsRS7Paj5vo4tcP_vppu57pP6bIEbz/pub?output=csv`;

export const fetchLeadsFromSheet = async (): Promise<Lead[]> => {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpWQ9iOtRSh86TNo7iy6ql-Hb4_IJG8ov81KKpVRmVu3E5QqKOfyvTUZuEcT-k_I7p/exec';
    const formData = new FormData();
    formData.append('action', 'getLeads');
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      const leads = await response.json();
      return leads.map((lead: any, index: number) => ({
        id: `sheet-${index}`,
        uid: lead.uid || `uid-${index}`,
        slNo: lead.slNo || '',
        phone: lead.phone || '',
        country: lead.country || '',
        place: lead.place || '',
        name: lead.name || '',
        leadQuality: mapCategory(lead.leadQuality) || LeadCategory.UNCATEGORIZED,
        businessIndustry: lead.businessIndustry || '',
        specialNotes: lead.specialNotes || '',
        currentStatus: mapStatus(lead.currentStatus) || LeadStatus.NEW,
        forwardedTo: lead.forwardedTo || '',
        dateTime: lead.dateTime || '',
      }));
    }
  } catch (error) {
    console.log('Error fetching leads:', error);
  }
  
  return [];
};

export const getSheetNames = async (): Promise<string[]> => {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpWQ9iOtRSh86TNo7iy6ql-Hb4_IJG8ov81KKpVRmVu3E5QqKOfyvTUZuEcT-k_I7p/exec';
    const formData = new FormData();
    formData.append('action', 'getSheets');
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const sheets = await response.json();
      return sheets;
    }
  } catch (error) {
    console.error('Error fetching sheet names:', error);
  }
  return ['All leads', 'Sales Team', 'Marketing Team', 'Support Team', 'Management'];
};

export const saveLeadToSheet = async (lead: Lead): Promise<boolean> => {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpWQ9iOtRSh86TNo7iy6ql-Hb4_IJG8ov81KKpVRmVu3E5QqKOfyvTUZuEcT-k_I7p/exec';
    
    const formData = new FormData();
    formData.append('action', 'saveToSheets');
    formData.append('uid', lead.uid);
    formData.append('dateTime', lead.dateTime);
    formData.append('slNo', lead.slNo);
    formData.append('phone', lead.phone);
    formData.append('country', lead.country);
    formData.append('place', lead.place);
    formData.append('name', lead.name);
    formData.append('leadQuality', lead.leadQuality === 'Genuine' ? 'HOT' : lead.leadQuality);
    formData.append('businessIndustry', lead.businessIndustry);
    formData.append('specialNotes', lead.specialNotes);
    formData.append('currentStatus', lead.currentStatus);
    formData.append('forwardedTo', lead.forwardedTo);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log('Lead saved to All leads and', lead.forwardedTo);
      return true;
    } else {
      throw new Error('Failed to save to sheet');
    }
    
  } catch (error) {
    console.error('Error saving lead:', error);
    return false;
  }
};

export const deleteLeadFromSheet = async (uid: string): Promise<boolean> => {
  try {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwpWQ9iOtRSh86TNo7iy6ql-Hb4_IJG8ov81KKpVRmVu3E5QqKOfyvTUZuEcT-k_I7p/exec';
    
    const formData = new FormData();
    formData.append('action', 'deleteLead');
    formData.append('uid', uid);
    
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      console.log('Lead deleted from all sheets');
      return true;
    } else {
      throw new Error('Failed to delete from sheets');
    }
    
  } catch (error) {
    console.error('Error deleting lead:', error);
    return false;
  }
};

const parseCSV = (csvText: string): Lead[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  console.log('Total lines:', lines.length);
  console.log('Header:', lines[0]);
  
  // Skip header row
  const dataRows = lines.slice(1);
  
  return dataRows.map((row, index) => {
    const cols = row.split(',').map(c => c.trim().replace(/"/g, ''));
    console.log(`Row ${index}:`, cols);
    
    // Columns: SL No, Lead Mobile Number, Country, Place, Name, Lead Quality, Business Industry, Special Notes, Current Status, Forwarded to, Date & Time
    return {
      id: `sheet-${index}`,
      uid: `uid-${index}`,
      slNo: cols[0] || '',
      phone: cols[1] || '',
      country: cols[2] || '',
      place: cols[3] || '',
      name: cols[4] || '',
      leadQuality: mapCategory(cols[5]) || LeadCategory.UNCATEGORIZED,
      businessIndustry: cols[6] || '',
      specialNotes: cols[7] || '',
      currentStatus: mapStatus(cols[8]) || LeadStatus.NEW,
      forwardedTo: cols[9] || '',
      dateTime: cols[10] || new Date().toISOString().slice(0, 16),
    };
  }).filter(l => l.phone && l.phone !== '');
};

const mapCategory = (categoryStr: string): LeadCategory => {
  const c = categoryStr?.toUpperCase() || '';
  if (c.includes('HOT')) return LeadCategory.HOT;
  if (c.includes('WARM')) return LeadCategory.WARM;
  if (c.includes('COLD')) return LeadCategory.COLD;
  if (c.includes('FAKE')) return LeadCategory.FAKE;
  return LeadCategory.UNCATEGORIZED;
};

const mapStatus = (statusStr: string): LeadStatus => {
  const s = statusStr?.toUpperCase() || '';
  if (s.includes('WIN') || s.includes('WON')) return LeadStatus.WON;
  if (s.includes('LOST')) return LeadStatus.LOST;
  if (s.includes('QUAL')) return LeadStatus.QUALIFIED;
  if (s.includes('CONT')) return LeadStatus.CONTACTED;
  if (s.includes('SPAM')) return LeadStatus.SPAM;
  return LeadStatus.NEW;
};
