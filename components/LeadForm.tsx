import React, { useEffect, useRef, useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { getSheetNames } from '../services/sheetService';
import { useSettings } from '../contexts/SettingsContext';

interface LeadFormProps {
  onSave: (lead: Lead) => void;
}

export const LeadForm: React.FC<LeadFormProps> = ({ onSave }) => {
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
    leadQuality: 'Genuine' as any,
    businessIndustry: '',
    specialNotes: '',
    currentStatus: LeadStatus.NEW,
    forwardedTo: '',
  });
  
  const [sheetNames, setSheetNames] = useState<string[]>([]);
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

  const handleSave = () => {
    onSave(formData);
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
      leadQuality: 'Genuine' as any,
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

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Lead Mobile Number <span className="text-red-500">*</span></label>
            <input
              ref={phoneRef}
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const phone = e.target.value;
                const country = getCountryFromPhone(phone);
                setFormData({...formData, phone, country: country || formData.country});
              }}
              onKeyDown={(e) => handleKeyDown(e, countryRef)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter mobile number"
            />
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
                <option value="Genuine">Genuine</option>
                <option value="WARM">WARM</option>
                <option value="COLD">COLD</option>
                <option value="FAKE">FAKE</option>
                <option value="UNCATEGORIZED">UNCATEGORIZED</option>
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