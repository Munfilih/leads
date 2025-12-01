import React from 'react';
import { Lead } from '../types';
import { X, Phone, MapPin, User, Calendar, Building, FileText, Target, Forward, MessageCircle, Edit, Trash2 } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  isAdminMode?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, isAdminMode, onEdit, onDelete }) => {
  if (!lead) {
    return null;
  }
  
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
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-900">{lead.phone}</p>
                </div>
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
                  <p className="font-medium text-slate-900">
                    {lead.dateTime ? new Date(lead.dateTime).toLocaleString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </p>
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
        
        <div className="px-6 pb-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-6"></div>
          <div className="flex items-center justify-center gap-4">
            <a
              href={`https://wa.me/${String(lead.phone || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 hover:text-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Open WhatsApp"
            >
              <MessageCircle size={20} />
            </a>
            <button 
              onClick={() => {
                const details = `Customer Name: ${lead.name || ''}
Mobile number: ${lead.phone}
Place: ${lead.place}
Business: ${lead.businessIndustry}`;
                navigator.clipboard.writeText(details).catch(() => {
                  const textArea = document.createElement('textarea');
                  textArea.value = details;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                });
              }}
              className="w-12 h-12 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Copy Details"
            >
              <Forward size={20} />
            </button>
            {isAdminMode && onEdit && (
              <button 
                onClick={() => onEdit(lead)}
                className="w-12 h-12 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Edit Lead"
              >
                <Edit size={20} />
              </button>
            )}
            {isAdminMode && onDelete && (
              <button 
                onClick={() => onDelete(lead.id)}
                className="w-12 h-12 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 hover:text-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                title="Delete Lead"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};