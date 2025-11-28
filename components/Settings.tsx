import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {}

export const Settings: React.FC<SettingsProps> = () => {
  const { leadQualities, businessIndustries, setLeadQualities, setBusinessIndustries } = useSettings();
  const [newQuality, setNewQuality] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  const addQuality = () => {
    if (newQuality.trim() && !leadQualities.includes(newQuality.trim().toUpperCase())) {
      setLeadQualities([...leadQualities, newQuality.trim().toUpperCase()]);
      setNewQuality('');
    }
  };

  const removeQuality = (quality: string) => {
    setLeadQualities(leadQualities.filter(q => q !== quality));
  };

  const addIndustry = () => {
    if (newIndustry.trim() && !businessIndustries.includes(newIndustry.trim())) {
      setBusinessIndustries([...businessIndustries, newIndustry.trim()]);
      setNewIndustry('');
    }
  };

  const removeIndustry = (industry: string) => {
    setBusinessIndustries(businessIndustries.filter(i => i !== industry));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
      
      {/* Lead Qualities Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Qualities</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuality}
              onChange={(e) => setNewQuality(e.target.value)}
              placeholder="Add new quality"
              className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && addQuality()}
            />
            <button
              onClick={addQuality}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {leadQualities.map((quality) => (
              <div key={quality} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">{quality}</span>
                <button
                  onClick={() => removeQuality(quality)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Business Industries Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Business Industries</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newIndustry}
              onChange={(e) => setNewIndustry(e.target.value)}
              placeholder="Add new industry"
              className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
            />
            <button
              onClick={addIndustry}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {businessIndustries.map((industry) => (
              <div key={industry} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700">{industry}</span>
                <button
                  onClick={() => removeIndustry(industry)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};