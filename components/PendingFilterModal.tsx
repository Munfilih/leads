import React from 'react';
import { Lead } from '../types';
import { X, Clock } from 'lucide-react';

interface PendingFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectPending: () => void;
}

export const PendingFilterModal: React.FC<PendingFilterModalProps> = ({ 
  isOpen, 
  onClose, 
  leads, 
  onSelectPending 
}) => {
  if (!isOpen) return null;

  const pendingLeads = leads.filter(l => !l.forwardedTo || l.forwardedTo.trim() === '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} />
            Pending Leads
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <button
            onClick={() => {
              onSelectPending();
              onClose();
            }}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
          >
            <span className="font-medium text-slate-900">Show Pending Leads</span>
            <span className="text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
              {pendingLeads.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};