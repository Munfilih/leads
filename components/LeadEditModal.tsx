import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { X } from 'lucide-react';
import { getSheetNames } from '../services/sheetService';
import { useSettings } from '../contexts/SettingsContext';

interface LeadEditModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export const LeadEditModal: React.FC<LeadEditModalProps> = ({ lead, onClose, onSave }) => {
  const { leadQualities, businessIndustries } = useSettings();
  const [formData, setFormData] = useState<Lead>({
    ...lead,
    dateTime: lead.dateTime ? (() => {
      const date = new Date(lead.dateTime);
      const offset = date.getTimezoneOffset() * 60000;
      const localDate = new Date(date.getTime() - offset);
      return localDate.toISOString().slice(0, 16);
    })() : (() => {
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localNow = new Date(now.getTime() - offset);
      return localNow.toISOString().slice(0, 16);
    })()
  });
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

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Edit Lead</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.dateTime}
              onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lead Mobile Number</label>
              <input
                ref={phoneRef}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Place</label>
              <input
                type="text"
                value={formData.place}
                onChange={(e) => setFormData({...formData, place: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lead Quality</label>
              <select 
                value={formData.leadQuality}
                onChange={(e) => setFormData({...formData, leadQuality: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {(() => {
                  const allQualities = leadQualities || ['Genuine', 'WARM', 'COLD', 'FAKE', 'UNCATEGORIZED'];
                  // Add current lead quality if it's not in the list
                  if (!allQualities.includes(formData.leadQuality)) {
                    allQualities.push(formData.leadQuality);
                  }
                  return allQualities.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Business Industry</label>
              <select
                value={formData.businessIndustry}
                onChange={(e) => setFormData({...formData, businessIndustry: e.target.value})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select industry...</option>
                {businessIndustries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Status</label>
              <select 
                value={formData.currentStatus}
                onChange={(e) => setFormData({...formData, currentStatus: e.target.value as LeadStatus})}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {Object.values(LeadStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Forwarded to</label>
              <select
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
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Special Notes</label>
            <textarea
              value={formData.specialNotes}
              onChange={(e) => setFormData({...formData, specialNotes: e.target.value})}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};