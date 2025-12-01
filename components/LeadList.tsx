import React, { useState } from 'react';
import { Lead, LeadCategory, LeadStatus } from '../types';
import { Search, Filter, MoreVertical, Edit, Plus, Trash2, MessageCircle, Forward } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { LeadEditModal } from './LeadEditModal';
import { normalizeText } from '../utils/caseInsensitiveUtils';

interface LeadListProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onNavigateEdit?: (lead: Lead) => void;
  onAddLead?: () => void;
  onDeleteLead?: (leadId: string) => void;
  sheetNames?: string[];
  placeFilter?: string;
  onClearPlaceFilter?: () => void;
  countryFilter?: string;
  onClearCountryFilter?: () => void;
  qualityFilter?: string;
  onClearQualityFilter?: () => void;
  teamFilter?: string;
  onClearTeamFilter?: () => void;
  statusFilter?: string;
  onClearStatusFilter?: () => void;
  hourFilter?: string;
  onClearHourFilter?: () => void;
  pendingFilter?: boolean;
  onClearPendingFilter?: () => void;
  dateFilter?: string;
  onClearDateFilter?: () => void;
  editingLead?: Lead | null;
  onSaveLead?: (lead: Lead) => void;
  onCloseEdit?: () => void;
}

export const LeadList: React.FC<LeadListProps> = ({ leads, onSelectLead, onEditLead, onAddLead, onDeleteLead, sheetNames = [], placeFilter, onClearPlaceFilter, countryFilter, onClearCountryFilter, qualityFilter, onClearQualityFilter, teamFilter, onClearTeamFilter, statusFilter, onClearStatusFilter, hourFilter, onClearHourFilter, pendingFilter, onClearPendingFilter, dateFilter, onClearDateFilter, editingLead, onSaveLead, onCloseEdit, onNavigateEdit }) => {
  const [filter, setFilter] = useState('');
  const [localStatusFilter, setLocalStatusFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [sheetFilter, setSheetFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>(() => {
    const saved = localStorage.getItem('leadSortOrder');
    return (saved as 'oldest' | 'newest') || 'newest';
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; leadId: string; leadName: string }>({ isOpen: false, leadId: '', leadName: '' });

  const filteredLeads = leads.filter(lead => {
    try {
      const searchTerm = filter.toLowerCase();
      const matchesText = (lead.name || '').toLowerCase().includes(searchTerm) || 
                          (lead.phone || '').toString().includes(searchTerm) ||
                          (lead.specialNotes || '').toLowerCase().includes(searchTerm) ||
                          (lead.country || '').toLowerCase().includes(searchTerm) ||
                          (lead.place || '').toLowerCase().includes(searchTerm) ||
                          (lead.leadQuality || '').toLowerCase().includes(searchTerm) ||
                          (lead.businessIndustry || '').toLowerCase().includes(searchTerm) ||
                          (lead.currentStatus || '').toLowerCase().includes(searchTerm) ||
                          (lead.forwardedTo || '').toLowerCase().includes(searchTerm) ||
                          (lead.slNo || '').toString().includes(searchTerm);
      const matchesStatus = statusFilter ? true : (localStatusFilter === 'ALL' || lead.currentStatus === localStatusFilter);
      const matchesSheet = sheetFilter === 'ALL' || lead.forwardedTo === sheetFilter || (sheetFilter === 'Unassigned' && !lead.forwardedTo);
      const matchesPlace = !placeFilter || normalizeText(lead.place || '') === normalizeText(placeFilter);
      const matchesCountry = !countryFilter || normalizeText(lead.country || '') === normalizeText(countryFilter);
      const matchesQuality = !qualityFilter || normalizeText(lead.leadQuality?.toString() || '') === normalizeText(qualityFilter);
      const matchesPending = !pendingFilter || (!lead.forwardedTo || lead.forwardedTo.trim() === '');
      const matchesTeam = !teamFilter || (() => {
        if (teamFilter === 'forwarded') {
          return lead.forwardedTo && lead.forwardedTo.trim() !== '' && lead.forwardedTo.toLowerCase() !== 'removed';
        }
        if (teamFilter === 'removed') {
          return lead.currentStatus === 'LOST' || lead.currentStatus === 'SPAM' || (lead.forwardedTo && lead.forwardedTo.toLowerCase() === 'removed');
        }
        return lead.forwardedTo && normalizeText(lead.forwardedTo) === normalizeText(teamFilter);
      })();

      const matchesStatusFilter = !statusFilter || normalizeText(lead.currentStatus?.toString() || '') === normalizeText(statusFilter);
      const matchesHour = !hourFilter || (() => {
        if (!lead.dateTime) return false;
        const hour = new Date(lead.dateTime.trim()).getHours();
        
        // Parse the hourFilter which is now in AM/PM format like "12:00 AM - 3:00 AM"
        if (hourFilter.includes('AM') || hourFilter.includes('PM')) {
          const [startStr, endStr] = hourFilter.split(' - ');
          const parseTime = (timeStr: string) => {
            const [time, period] = timeStr.split(' ');
            let hour = parseInt(time.split(':')[0]);
            if (period === 'AM' && hour === 12) hour = 0;
            if (period === 'PM' && hour !== 12) hour += 12;
            return hour;
          };
          
          const startHour = parseTime(startStr);
          const endHour = parseTime(endStr);
          
          if (endHour === 0) { // Handle midnight case
            return hour >= startHour || hour < 24;
          }
          return hour >= startHour && hour < endHour;
        }
        
        // Fallback for old format
        const timeRange = `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`;
        return timeRange === hourFilter;
      })();
      const matchesDate = !dateFilter || (() => {
        if (!lead.dateTime) return false;
        const leadDate = new Date(lead.dateTime);
        const leadDateStr = leadDate.getFullYear() + '-' + 
          String(leadDate.getMonth() + 1).padStart(2, '0') + '-' + 
          String(leadDate.getDate()).padStart(2, '0');
        return leadDateStr === dateFilter;
      })();
      return matchesText && matchesStatus && matchesSheet && matchesPlace && matchesCountry && matchesQuality && matchesTeam && matchesStatusFilter && matchesHour && matchesPending && matchesDate;
    } catch (error) {
      console.error('Filter error:', error);
      return true;
    }
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
      [LeadStatus.WAITING_LIST]: 'bg-purple-100 text-purple-700',
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

  const copyLeadDetails = (lead: Lead) => {
    const details = `Customer Name: ${lead.name || ''}
Mobile number: ${lead.phone}
Place: ${lead.place}
Business: ${lead.businessIndustry}`;
    
    navigator.clipboard.writeText(details).then(() => {
      // Could add a toast notification here
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = details;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  };

  const getTeamColor = (teamName: string) => {
    if (!teamName || teamName === 'Not assigned') return 'text-yellow-600';
    if (teamName.toLowerCase() === 'removed') return 'text-red-600';
    const colors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-pink-600', 'text-indigo-600', 'text-teal-600'];
    const hash = teamName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Filtered Count Display */}
      <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-center">
        <span className="text-slate-700 font-medium">
          Showing {filteredLeads.length} of {leads.length} leads
        </span>
      </div>
      
      {placeFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-blue-800 text-sm">
            Filtered by place: <strong>{placeFilter}</strong>
          </span>
          <button
            onClick={onClearPlaceFilter}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {countryFilter && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-purple-800 text-sm">
            Filtered by country: <strong>{countryFilter}</strong>
          </span>
          <button
            onClick={onClearCountryFilter}
            className="text-purple-600 hover:text-purple-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {qualityFilter && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-green-800 text-sm">
            Filtered by quality: <strong>{qualityFilter}</strong>
          </span>
          <button
            onClick={onClearQualityFilter}
            className="text-green-600 hover:text-green-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {teamFilter && !pendingFilter && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-orange-800 text-sm">
            Filtered by team: <strong>{teamFilter}</strong>
          </span>
          <button
            onClick={onClearTeamFilter}
            className="text-orange-600 hover:text-orange-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {statusFilter && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-red-800 text-sm">
            Filtered by status: <strong>{statusFilter}</strong>
          </span>
          <button
            onClick={onClearStatusFilter}
            className="text-red-600 hover:text-red-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {hourFilter && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-indigo-800 text-sm">
            Filtered by hour: <strong>{hourFilter}</strong>
          </span>
          <button
            onClick={onClearHourFilter}
            className="text-indigo-600 hover:text-indigo-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {pendingFilter && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-yellow-800 text-sm">
            Showing pending leads only
          </span>
          <button
            onClick={onClearPendingFilter}
            className="text-yellow-600 hover:text-yellow-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
      {dateFilter && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-cyan-800 text-sm">
            Filtered by date: <strong>{new Date(dateFilter).toLocaleDateString()}</strong>
          </span>
          <button
            onClick={onClearDateFilter}
            className="text-cyan-600 hover:text-cyan-800 text-sm underline"
          >
            Clear filter
          </button>
        </div>
      )}
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
                value={localStatusFilter}
                onChange={(e) => setLocalStatusFilter(e.target.value as LeadStatus | 'ALL')}
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
                onChange={(e) => {
                  const newOrder = e.target.value as 'oldest' | 'newest';
                  setSortOrder(newOrder);
                  localStorage.setItem('leadSortOrder', newOrder);
                }}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
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
                <th scope="col" className="px-2 py-4 font-semibold w-16">SL No</th>
                <th scope="col" className="px-3 py-4 font-semibold">Name</th>
                <th scope="col" className="px-3 py-4 font-semibold">Phone</th>
                <th scope="col" className="px-3 py-4 font-semibold">Country</th>
                <th scope="col" className="px-3 py-4 font-semibold">Quality</th>
                <th scope="col" className="px-3 py-4 font-semibold">Status</th>
                <th scope="col" className="px-3 py-4 font-semibold">Forwarded To</th>
                <th scope="col" className="px-3 py-4 font-semibold">Date & Time</th>
                <th scope="col" className="px-3 py-4 font-semibold text-right">Action</th>
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
                    <td className="px-2 py-4 whitespace-nowrap text-sm font-medium w-16">
                        {lead.slNo || 'N/A'}
                    </td>
                    <td className="px-3 py-4 font-medium text-slate-900">
                        {lead.name || 'N/A'}
                    </td>
                    <td className="px-3 py-4 text-sm">
                        {lead.phone}
                    </td>
                    <td className="px-3 py-4 text-sm">
                        {lead.country}
                    </td>
                    <td className="px-3 py-4 text-sm">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {lead.leadQuality || 'N/A'}
                        </span>
                    </td>
                    <td className="px-3 py-4">
                        {getStatusBadge(lead.currentStatus)}
                    </td>
                    <td className="px-3 py-4 text-sm">
                        <span className={`font-medium ${getTeamColor(lead.forwardedTo || 'Not assigned')}`}>
                          {lead.forwardedTo || 'Not assigned'}
                        </span>
                    </td>
                    <td className="px-3 py-4 text-sm">
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
                    <td className="px-3 py-4 text-right">
                        <div className="flex items-center justify-end gap-6">
                            <a
                              href={`https://wa.me/${String(lead.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-slate-400 hover:text-green-600 transition-colors"
                              title="Open WhatsApp"
                            >
                              <MessageCircle size={16} />
                            </a>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyLeadDetails(lead);
                                }}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="Copy Details"
                            >
                                <Forward size={16} />
                            </button>

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
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
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
                <div className="flex items-center gap-6">
                  <a
                    href={`https://wa.me/${String(lead.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-green-600 transition-colors"
                    title="Open WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      copyLeadDetails(lead);
                    }}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="Copy Details"
                  >
                    <Forward size={16} />
                  </button>

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
                <div className="flex justify-between">
                  <span className="text-slate-500">Quality:</span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                    {lead.leadQuality || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Status:</span>
                  {getStatusBadge(lead.currentStatus)}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned:</span>
                  <span className={`font-medium ${getTeamColor(lead.forwardedTo || 'Not assigned')}`}>
                    {lead.forwardedTo || 'Not assigned'}
                  </span>
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
      
      {editingLead && onSaveLead && onCloseEdit && (
        <LeadEditModal 
          lead={editingLead} 
          onClose={onCloseEdit}
          onSave={onSaveLead}
          onNext={() => {
            const currentIndex = filteredLeads.findIndex(l => l.id === editingLead.id);
            if (currentIndex < filteredLeads.length - 1 && onNavigateEdit) {
              onNavigateEdit(filteredLeads[currentIndex + 1]);
            }
          }}
          onPrevious={() => {
            const currentIndex = filteredLeads.findIndex(l => l.id === editingLead.id);
            if (currentIndex > 0 && onNavigateEdit) {
              onNavigateEdit(filteredLeads[currentIndex - 1]);
            }
          }}
          hasNext={(() => {
            const currentIndex = filteredLeads.findIndex(l => l.id === editingLead.id);
            return currentIndex < filteredLeads.length - 1;
          })()}
          hasPrevious={(() => {
            const currentIndex = filteredLeads.findIndex(l => l.id === editingLead.id);
            return currentIndex > 0;
          })()}
        />
      )}
    </div>
  );
};