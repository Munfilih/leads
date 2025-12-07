import React, { useEffect, useRef, useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { getSheetNames } from '../services/sheetService';
import { useSettings } from '../contexts/SettingsContext';

interface LeadFormProps {
  onSave: (lead: Lead) => void;
  leads: Lead[];
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSave, leads }) => {
  const { leadQualities, businessIndustries } = useSettings();
  console.log('LeadForm - leadQualities:', leadQualities);
  console.log('LeadForm - businessIndustries:', businessIndustries);
  const [formData, setFormData] = useState<Lead>({
    id: `new-${Date.now()}`,
    uid: `uid-${Date.now()}`,
    dateTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    slNo: '',
    phone: '',
    country: '',
    place: '',
    name: '',
    leadQuality: 'TO BE RESPONDED',
    businessIndustry: '',
    specialNotes: '',
    currentStatus: LeadStatus.NEW,
    forwardedTo: '',
  });
  
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [duplicateError, setDuplicateError] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredNumbers, setFilteredNumbers] = useState<Lead[]>([]);
  const [exactMatch, setExactMatch] = useState<Lead | null>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const getCountryFromPhone = (phone: string): string => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.startsWith('+91') || cleanPhone.startsWith('91')) return 'India';
    if (cleanPhone.startsWith('+1')) return 'USA';
    if (cleanPhone.startsWith('+44')) return 'UK';
    if (cleanPhone.startsWith('+971')) return 'UAE';
    if (cleanPhone.startsWith('+966')) return 'Saudi Arabia';
    if (cleanPhone.startsWith('+974')) return 'Qatar';
    if (cleanPhone.startsWith('+965')) return 'Kuwait';
    if (cleanPhone.startsWith('+973')) return 'Bahrain';
    if (cleanPhone.startsWith('+968')) return 'Oman';
    if (cleanPhone.startsWith('+60')) return 'Malaysia';
    if (cleanPhone.startsWith('+65')) return 'Singapore';
    return '';
  };

  useEffect(() => {
    phoneRef.current?.focus();
    loadSheetNames();
  }, []);
  
  useEffect(() => {
    // Add F5 key listener for quick save
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5') {
        e.preventDefault();
        handleSave();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [formData, leads, duplicateError]);

  const loadSheetNames = async () => {
    const sheets = await getSheetNames();
    setSheetNames(sheets);
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter' && nextRef?.current) {
      e.preventDefault();
      nextRef.current.focus();
    }
  };

  const countryRef = useRef<HTMLInputElement>(null);
  const placeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const qualityRef = useRef<HTMLSelectElement>(null);
  const industryRef = useRef<HTMLInputElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const forwardedRef = useRef<HTMLSelectElement>(null);

  const checkDuplicate = (phone: string): boolean => {
    if (!phone || phone.length < 8) return false;
    const last8Digits = phone.replace(/[^0-9]/g, '').slice(-8);
    return leads.some(lead => {
      const leadLast8 = lead.phone.replace(/[^0-9]/g, '').slice(-8);
      return leadLast8 === last8Digits;
    });
  };

  const handleSave = () => {
    if (!formData.phone || formData.phone.trim() === '') {
      setDuplicateError('Phone number is required!');
      return;
    }
    
    if (checkDuplicate(formData.phone)) {
      setDuplicateError('A lead with the same last 8 digits already exists!');
      return;
    }
    setDuplicateError('');
    
    // Ensure phone number starts with + if it exists
    console.log('Original phone:', formData.phone);
    const phoneWithPlus = formData.phone && !formData.phone.startsWith('+') ? `+${formData.phone}` : formData.phone;
    console.log('Phone with plus:', phoneWithPlus);
    
    // Auto-generate SL No if empty
    const maxSlNo = leads.reduce((max, lead) => {
      const num = parseInt(lead.slNo) || 0;
      return num > max ? num : max;
    }, 0);
    const slNo = formData.slNo || (maxSlNo + 1).toString();
    
    const leadToSave = { ...formData, phone: phoneWithPlus, slNo };
    console.log('Lead to save:', leadToSave);
    
    onSave(leadToSave);
    // Reset form
    setFormData({
      id: `new-${Date.now()}`,
      uid: `uid-${Date.now()}`,
      dateTime: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      slNo: '',
      phone: '',
      country: '',
      place: '',
      name: '',
      leadQuality: 'TO BE RESPONDED',
      businessIndustry: '',
      specialNotes: '',
      currentStatus: LeadStatus.NEW,
      forwardedTo: '',
    });
    phoneRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Add New Lead</h2>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Lead Information</h3>
        
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, phoneRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lead Mobile Number <span className="text-red-500">*</span></label>
            <input
              ref={phoneRef}
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const phone = e.target.value;
                const country = getCountryFromPhone(phone);
                setFormData({...formData, phone, country: country || formData.country});
                if (duplicateError) setDuplicateError('');
                
                // Filter existing numbers
                if (phone.length >= 1) {
                  console.log('Total leads:', leads.length);
                  console.log('Leads with phone:', leads.filter(l => l.phone).length);
                  console.log('Sample phone numbers:', leads.slice(0, 5).map(l => l.phone));
                  let filtered;
                  if (phone === '+') {
                    // Show all numbers when typing just + (since DB doesn't store +)
                    filtered = leads.filter(lead => 
                      lead.phone && typeof lead.phone === 'string'
                    ).slice(0, 10);
                  } else {
                    // Filter by what user typed
                    // Remove + from search since DB doesn't store it
                    const searchPhone = phone.replace('+', '');
                    filtered = leads.filter(lead => 
                      lead.phone && typeof lead.phone === 'string' && 
                      lead.phone.includes(searchPhone)
                    ).slice(0, 10);
                  }
                  console.log('Filtered results:', filtered.length);
                  setFilteredNumbers(filtered);
                  setShowSuggestions(filtered.length > 0);
                  
                  // Check for exact match
                  const exact = leads.find(lead => lead.phone === phone);
                  setExactMatch(exact || null);
                } else {
                  setShowSuggestions(false);
                  setFilteredNumbers([]);
                  setExactMatch(null);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setShowSuggestions(false);
                } else {
                  handleKeyDown(e, countryRef);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Enter mobile number"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${duplicateError ? 'border-red-500' : 'border-slate-300'}`}
            />
            {duplicateError && (
              <p className="text-red-500 text-sm mt-1">{duplicateError}</p>
            )}
            {exactMatch && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-medium text-sm mb-2">Lead already exists!</p>
                <div className="text-xs text-red-600">
                  <p><strong>Name:</strong> {exactMatch.name || 'N/A'}</p>
                  <p><strong>Country:</strong> {exactMatch.country}</p>
                  <p><strong>Status:</strong> {exactMatch.currentStatus}</p>
                  <p><strong>Assigned to:</strong> {exactMatch.forwardedTo || 'Not assigned'}</p>
                </div>
              </div>
            )}
            {showSuggestions && filteredNumbers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredNumbers.map((lead, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                    onClick={() => {
                      setFormData({...formData, phone: lead.phone});
                      setShowSuggestions(false);
                    }}
                  >
                    <div className="font-medium text-sm">{lead.phone}</div>
                    <div className="text-xs text-slate-500">{lead.name || 'N/A'} - {lead.country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
            <input
              ref={countryRef}
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, placeRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter country"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Place</label>
            <input
              ref={placeRef}
              type="text"
              value={formData.place}
              onChange={(e) => setFormData({...formData, place: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, nameRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter place"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              ref={nameRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, qualityRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lead Quality</label>
            <select 
                ref={qualityRef}
                value={formData.leadQuality}
                onChange={(e) => setFormData({...formData, leadQuality: e.target.value})}
                onKeyDown={(e) => handleKeyDown(e, industryRef)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {(leadQualities || ['GENUINE', 'WARM', 'COLD', 'FAKE', 'UNCATEGORIZED']).map(c => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Business Industry</label>
            <select
              ref={industryRef}
              value={formData.businessIndustry}
              onChange={(e) => setFormData({...formData, businessIndustry: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, notesRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select industry...</option>
              {businessIndustries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Notes</label>
            <textarea
              ref={notesRef}
              value={formData.specialNotes}
              onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
              onKeyDown={(e) => handleKeyDown(e, statusRef)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Enter special notes"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
            <select 
                ref={statusRef}
                value={formData.currentStatus}
                onChange={(e) => setFormData({...formData, currentStatus: e.target.value as LeadStatus})}
                onKeyDown={(e) => handleKeyDown(e, forwardedRef)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
                {Object.values(LeadStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Forwarded to</label>
            <select
              ref={forwardedRef}
              value={formData.forwardedTo}
              onChange={(e) => setFormData({...formData, forwardedTo: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select sheet...</option>
              {sheetNames.map(sheet => (
                <option key={sheet} value={sheet}>{sheet}</option>
              ))}
            </select>
          </div>

          <div className="pt-6 border-t border-slate-200">
            <button
              onClick={handleSave}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};