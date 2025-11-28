import React, { useEffect, useRef, useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { getSheetNames } from '../services/sheetService';
import { useSettings } from '../contexts/SettingsContext';
import { X } from 'lucide-react';

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

export const LeadDetail: React.FC<LeadDetailProps> = ({ lead, onClose, onUpdate }) => {
  const { leadQualities, businessIndustries } = useSettings();
  const [formData, setFormData] = useState(lead);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const phoneRef = useRef<HTMLInputElement>(null);

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
  const forwardedRef = useRef<HTMLInputElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity p-4">
      <div className="w-full max-w-xl max-h-[90vh] bg-white shadow-lg overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-normal text-gray-800">Lead Information</h1>
                    <p className="text-sm text-gray-600 mt-1">Please fill out the form below</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>
            </div>
        </div>

        <div className="p-6 space-y-8">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, phoneRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Lead Mobile Number <span className="text-red-500">*</span></label>
                <input
                  ref={phoneRef}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, countryRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <input
                  ref={countryRef}
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, placeRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Place</label>
                <input
                  ref={placeRef}
                  type="text"
                  value={formData.place}
                  onChange={(e) => setFormData({...formData, place: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, nameRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  ref={nameRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, qualityRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Lead Quality</label>
                <select 
                    ref={qualityRef}
                    value={formData.leadQuality}
                    onChange={(e) => setFormData({...formData, leadQuality: e.target.value as LeadCategory})}
                    onKeyDown={(e) => handleKeyDown(e, industryRef)}
                    className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                >
                    {leadQualities.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Business Industry</label>
                <input
                  ref={industryRef}
                  type="text"
                  value={formData.businessIndustry}
                  onChange={(e) => setFormData({...formData, businessIndustry: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, notesRef)}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Special Notes</label>
                <textarea
                  ref={notesRef}
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
                  onKeyDown={(e) => handleKeyDown(e, statusRef)}
                  rows={3}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent resize-none"
                  placeholder="Your answer"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Current Status</label>
                <select 
                    ref={statusRef}
                    value={formData.currentStatus}
                    onChange={(e) => setFormData({...formData, currentStatus: e.target.value as LeadStatus})}
                    onKeyDown={(e) => handleKeyDown(e, forwardedRef)}
                    className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                >
                    {Object.values(LeadStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Forwarded to</label>
                <select
                  ref={forwardedRef}
                  value={formData.forwardedTo}
                  onChange={(e) => setFormData({...formData, forwardedTo: e.target.value})}
                  className="w-full px-0 py-2 text-base border-0 border-b border-gray-300 focus:border-b-2 focus:border-blue-600 focus:outline-none bg-transparent"
                >
                  <option value="">Select sheet...</option>
                  {sheetNames.map(sheet => (
                    <option key={sheet} value={sheet}>{sheet}</option>
                  ))}
                </select>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                    onClick={() => onUpdate(formData)}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Save
                </button>
                <button
                    onClick={onClose}
                    className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                    Close
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};