import React from 'react';
import { Lead } from '../types';
import { X, Phone, MapPin, User, Calendar, Building, FileText, Target, Forward, MessageCircle } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Lead Details</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium text-slate-900">{lead.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-slate-400" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">{lead.phone}</p>
                </div>
                <a
                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title="Open WhatsApp Chat"
                >
                  <MessageCircle size={18} />
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-900">{lead.place}, {lead.country}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Date & Time</p>
                  <p className="font-medium text-slate-900">{new Date(lead.dateTime).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Target className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Lead Quality</p>
                  <p className="font-medium text-slate-900">{lead.leadQuality}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Business Industry</p>
                  <p className="font-medium text-slate-900">{lead.businessIndustry || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Current Status</p>
                  <p className="font-medium text-slate-900">{lead.currentStatus}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Forward className="text-slate-400" size={20} />
                <div>
                  <p className="text-sm text-slate-500">Forwarded To</p>
                  <p className="font-medium text-slate-900">{lead.forwardedTo || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {lead.specialNotes && (
            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-start gap-3">
                <FileText className="text-slate-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-slate-500 mb-2">Special Notes</p>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{lead.specialNotes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        

      </div>
    </div>
  );
};