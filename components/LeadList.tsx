import React, { useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { Search, Filter, MoreVertical, Edit, Plus, Trash2, MessageCircle } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface LeadListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onAddLead?: () => void;
  onDeleteLead?: (leadId: string) => void;
  sheetNames?: string[];
}

export const LeadList: React.FC<LeadListProps> = ({ leads, onSelectLead, onEditLead, onAddLead, onDeleteLead, sheetNames = [] }) => {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [sheetFilter, setSheetFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; leadId: string; leadName: string }>({ isOpen: false, leadId: '', leadName: '' });

  const filteredLeads = leads.filter(lead => {
    const matchesText = (lead.name || '').toLowerCase().includes(filter.toLowerCase()) || 
                        lead.phone.includes(filter) ||
                        (lead.specialNotes || '').toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.currentStatus === statusFilter;
    const matchesSheet = sheetFilter === 'ALL' || lead.forwardedTo === sheetFilter || (sheetFilter === 'Unassigned' && !lead.forwardedTo);
    return matchesText && matchesStatus && matchesSheet;
  }).sort((a, b) => {
    const dateA = new Date(a.dateTime || 0);
    const dateB = new Date(b.dateTime || 0);
    return sortOrder === 'oldest' 
      ? dateA.getTime() - dateB.getTime() // Oldest first
      : dateB.getTime() - dateA.getTime(); // Newest first
  });

  const getStatusBadge = (status: LeadStatus) => {
    const styles = {
      [LeadStatus.NEW]: 'bg-indigo-100 text-indigo-700',
      [LeadStatus.CONTACTED]: 'bg-blue-100 text-blue-700',
      [LeadStatus.QUALIFIED]: 'bg-emerald-100 text-emerald-700',
      [LeadStatus.WON]: 'bg-amber-100 text-amber-700',
      [LeadStatus.LOST]: 'bg-slate-100 text-slate-700',
      [LeadStatus.SPAM]: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status}
      </span>
    );
  };

  const getCategoryDot = (cat: LeadCategory) => {
    const colors = {
        [LeadCategory.HOT]: 'bg-red-500',
        [LeadCategory.WARM]: 'bg-orange-500',
        [LeadCategory.COLD]: 'bg-blue-500',
        [LeadCategory.FAKE]: 'bg-slate-500',
        [LeadCategory.UNCATEGORIZED]: 'bg-slate-300',
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${colors[cat]}`} title={cat} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
            >
                <option value="ALL">All Status</option>
                {Object.values(LeadStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
            <select
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                value={sheetFilter}
                onChange={(e) => setSheetFilter(e.target.value)}
            >
                <option value="ALL">All Staffs</option>
                <option value="Unassigned">Unassigned</option>
                {sheetNames.filter(sheet => sheet !== 'All leads' && sheet !== 'Settings').map(sheet => (
                    <option key={sheet} value={sheet}>{sheet}</option>
                ))}
            </select>
            <select
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'oldest' | 'newest')}
            >
                <option value="oldest">Oldest First</option>
                <option value="newest">Newest First</option>
            </select>
            {onAddLead && (
              <button
                onClick={onAddLead}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <Plus size={16} />
                Add Lead
              </button>
            )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">SL No</th>
                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Phone</th>
                <th scope="col" className="px-6 py-4 font-semibold">Country</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Forwarded To</th>
                <th scope="col" className="px-6 py-4 font-semibold">Date & Time</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                    <tr 
                        key={lead.id} 
                        onClick={() => onSelectLead(lead)}
                        className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {lead.slNo || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                        {lead.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {lead.phone}
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {lead.country}
                    </td>
                    <td className="px-6 py-4">
                        {getStatusBadge(lead.currentStatus)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {lead.forwardedTo || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                        {lead.dateTime ? new Date(lead.dateTime).toLocaleString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                            <a
                              href={`whatsapp://send?phone=${String(lead.phone || '').replace(/[^0-9]/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-green-600 transition-colors"
                              title="Open WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                            {onEditLead && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditLead(lead);
                                    }}
                                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                            {onDeleteLead && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirm({ isOpen: true, leadId: lead.id, leadName: lead.name || lead.phone });
                                    }}
                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        No leads found matching your criteria.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <div 
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getCategoryDot(lead.leadQuality)}
                  <h3 className="font-semibold text-slate-900">#{lead.slNo || 'N/A'} {lead.name || 'N/A'}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`whatsapp://send?phone=${String(lead.phone || '').replace(/[^0-9]/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-green-600 transition-colors"
                    title="Open WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  {onEditLead && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLead(lead);
                      }}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  )}
                  {onDeleteLead && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm({ isOpen: true, leadId: lead.id, leadName: lead.name || lead.phone });
                      }}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-medium">{lead.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span>{lead.place}, {lead.country}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  {getStatusBadge(lead.currentStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned:</span>
                  <span>{lead.forwardedTo || 'Not assigned'}</span>
                </div>
                {lead.dateTime && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date:</span>
                    <span>{new Date(lead.dateTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
            No leads found matching your criteria.
          </div>
        )}
      </div>
      
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Lead"
        message={`Are you sure you want to delete the lead "${deleteConfirm.leadName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          if (onDeleteLead) {
            onDeleteLead(deleteConfirm.leadId);
          }
          setDeleteConfirm({ isOpen: false, leadId: '', leadName: '' });
        }}
        onCancel={() => setDeleteConfirm({ isOpen: false, leadId: '', leadName: '' })}
      />
    </div>
  );
};