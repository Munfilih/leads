import React, { useState, useRef, useEffect } from 'react';
import { Lead, LeadStatus, LeadCategory } from '../types';
import { Users, UserCheck, AlertTriangle, TrendingUp, MapPin, Building, Award, Clock, Target } from 'lucide-react';
import { PlaceFilterModal } from './PlaceFilterModal';
import { CountryFilterModal } from './CountryFilterModal';
import { QualityFilterModal } from './QualityFilterModal';
import { TeamFilterModal } from './TeamFilterModal';
import { StatusFilterModal } from './StatusFilterModal';
import { HourFilterModal } from './HourFilterModal';
import { PendingFilterModal } from './PendingFilterModal';
import { countByCaseInsensitive } from '../utils/caseInsensitiveUtils';


interface DashboardProps {
  leads: Lead[];
  onFilterByPlace?: (place: string) => void;
  onFilterByCountry?: (country: string) => void;
  onFilterByQuality?: (quality: string) => void;
  onFilterByTeam?: (team: string) => void;
  onFilterByStatus?: (status: string) => void;
  onFilterByHour?: (hour: string) => void;
  onFilterByDate?: (date: string) => void;
  onFilterTotal?: () => void;
  onFilterPending?: () => void;
  onFilterForwarded?: () => void;
  onFilterRemoved?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, onFilterByPlace, onFilterByCountry, onFilterByQuality, onFilterByTeam, onFilterByStatus, onFilterByHour, onFilterByDate, onFilterTotal, onFilterPending, onFilterForwarded, onFilterRemoved }) => {
  const chartScrollRef = useRef<HTMLDivElement>(null);
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHourModal, setShowHourModal] = useState(false);
  const [hourGrouping, setHourGrouping] = useState<1 | 3 | 6 | 12>(1);
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.currentStatus === LeadStatus.NEW).length,
    pending: leads.filter(l => !l.forwardedTo || l.forwardedTo.trim() === '').length,
    won: leads.filter(l => l.currentStatus === LeadStatus.WON).length,
    qualified: leads.filter(l => l.currentStatus === LeadStatus.QUALIFIED).length,
    contacted: leads.filter(l => l.currentStatus === LeadStatus.CONTACTED).length,
    forwarded: leads.filter(l => l.forwardedTo && l.forwardedTo !== '' && l.forwardedTo.toLowerCase() !== 'removed').length,
    removed: leads.filter(l => l.currentStatus === LeadStatus.LOST || l.currentStatus === LeadStatus.SPAM || (l.forwardedTo && l.forwardedTo.toLowerCase() === 'removed')).length,
  };

  // Recent activity (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentLeads = leads.filter(lead => {
    if (!lead.dateTime) return false;
    const leadDate = new Date(lead.dateTime);
    return leadDate >= sevenDaysAgo;
  }).length;

  // Top countries
  const countryStats = countByCaseInsensitive(leads.filter(l => l.country), l => l.country);
  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Industry distribution
  const industryStats = countByCaseInsensitive(leads.filter(l => l.businessIndustry), l => l.businessIndustry);
  const topIndustries = Object.entries(industryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const forwardRate = stats.total > 0 ? ((stats.forwarded / stats.total) * 100).toFixed(1) : '0';
  const removedRate = stats.total > 0 ? ((stats.removed / stats.total) * 100).toFixed(1) : '0';
  const pendingRate = stats.total > 0 ? ((stats.pending / stats.total) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
    }
  }, [leads]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterTotal && onFilterTotal()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-400 mt-1">{recentLeads} this week</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterPending && onFilterPending()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending Leads</p>
              <p className="text-2xl font-bold text-orange-600">{pendingRate}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.pending} of {stats.total} leads</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterForwarded && onFilterForwarded()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Forward Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{forwardRate}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.forwarded} of {stats.total} leads</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onFilterRemoved && onFilterRemoved()}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Removed/Lost</p>
              <p className="text-2xl font-bold text-red-600">{removedRate}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.removed} of {stats.total} leads</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Pipeline */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            setShowStatusModal(true);
          }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Lead Pipeline
          </h3>
          <div className="space-y-3">
            {(() => {
              const statusStats = countByCaseInsensitive(leads.filter(l => l.currentStatus), l => l.currentStatus.toString());
              
              console.log('Status stats:', statusStats);
              
              const statusColors: Record<string, string> = {
                'NEW': 'bg-blue-500',
                'CONTACTED': 'bg-yellow-500',
                'QUALIFIED': 'bg-orange-500',
                'WON': 'bg-green-500',
                'LOST': 'bg-red-500',
                'SPAM': 'bg-gray-500'
              };
              
              return Object.entries(statusStats)
                .sort(([,a], [,b]) => b - a)
                .map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div className={`${statusColors[status] || 'bg-slate-500'} h-2 rounded-full`} style={{width: `${stats.total > 0 ? (count/stats.total)*100 : 0}%`}}></div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-8">{count}</span>
                    </div>
                  </div>
                ));
            })()}
          </div>
        </div>

        {/* Top Places */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            console.log('Top Places clicked');
            setShowPlaceModal(true);
          }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Places
          </h3>
          <div className="space-y-3">
            {(() => {
              const placeStats = countByCaseInsensitive(leads.filter(l => l.place), l => l.place);
              const topPlaces = Object.entries(placeStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5);
              
              return topPlaces.length > 0 ? topPlaces.map(([place, count]) => (
                <div key={place} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{place}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${(count/stats.total)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8">{count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No place data available</p>
              );
            })()}
          </div>
        </div>

        {/* Top Countries */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            setShowCountryModal(true);
          }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {topCountries.length > 0 ? topCountries.map(([country, count]) => (
              <div key={country} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{country}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(count/stats.total)*100}%`}}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-8">{count}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400">No country data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Time & Team Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Quality */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            setShowQualityModal(true);
          }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Lead Quality
          </h3>
          <div className="space-y-3">
            {(() => {
              const qualityStats = countByCaseInsensitive(leads.filter(l => l.leadQuality), l => l.leadQuality);
              
              return Object.entries(qualityStats)
                .filter(([, count]) => count > 0)
                .map(([quality, count]) => (
                  <div key={quality} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{quality}</span>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                ));
            })()}
          </div>
        </div>
        {/* Peak Hours */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            setShowHourModal(true);
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Peak Engagement Hours
            </h3>
            <select
              value={hourGrouping}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setHourGrouping(parseInt(e.target.value) as 1 | 3 | 6 | 12);
              }}
              className="text-xs border border-slate-300 rounded px-2 py-1"
            >
              <option value={1}>Hourly</option>
              <option value={3}>3 Hours</option>
              <option value={6}>6 Hours</option>
              <option value={12}>12 Hours</option>
            </select>
          </div>
          <div className="space-y-3">
            {(() => {
              const hourStats = leads.reduce((acc, lead) => {
                if (lead.dateTime && lead.dateTime.trim()) {
                  const hour = new Date(lead.dateTime.trim()).getHours();
                  const groupedHour = Math.floor(hour / hourGrouping) * hourGrouping;
                  acc[groupedHour] = (acc[groupedHour] || 0) + 1;
                }
                return acc;
              }, {} as Record<number, number>);
              
              const topHours = Object.entries(hourStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([hour, count]) => {
                  const startHour = parseInt(hour);
                  const endHour = startHour + hourGrouping;
                  
                  const formatHour = (h: number) => {
                    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    const ampm = h < 12 ? 'AM' : 'PM';
                    return `${hour12}:00 ${ampm}`;
                  };
                  
                  const timeRange = `${formatHour(startHour)} - ${formatHour(endHour % 24)}`;
                  
                  return {
                    hour: startHour,
                    count,
                    timeRange
                  };
                });

              return topHours.length > 0 ? topHours.map(({hour, count, timeRange}) => (
                <div key={hour} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{timeRange}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(count/stats.total)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-8">{count}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No time data available</p>
              );
            })()}
          </div>
        </div>

        {/* Team Performance */}
        <div 
          className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={(e) => {
            e.preventDefault();
            setShowTeamModal(true);
          }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Team Distribution
          </h3>
          <div className="space-y-3">
            {(() => {
              const teamStats = leads.reduce((acc, lead) => {
                if (lead.forwardedTo && lead.forwardedTo.trim() && lead.forwardedTo.toLowerCase() !== 'removed') {
                  const team = lead.forwardedTo.trim();
                  if (!acc[team]) {
                    acc[team] = { total: 0, won: 0, genuine: 0 };
                  }
                  acc[team].total++;
                  if (lead.currentStatus === LeadStatus.WON) acc[team].won++;
                  if (lead.leadQuality === 'Genuine' || lead.leadQuality === 'GENUINE' || lead.leadQuality === 'HOT' || lead.leadQuality === LeadCategory.HOT) acc[team].genuine++;
                }
                return acc;
              }, {} as Record<string, { total: number; won: number; hot: number }>);

              return Object.entries(teamStats)
                .sort(([,a], [,b]) => b.total - a.total)
                .slice(0, 5)
                .map(([team, stats]) => {
                  const winRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(0) : '0';
                  return (
                    <div key={team} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-800">{team}</span>
                        <span className="text-xs text-slate-500">{stats.total} leads</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600">{stats.won} won ({winRate}%)</span>
                        <span className="text-green-600">{stats.genuine} genuine</span>
                      </div>
                    </div>
                  );
                });
            })()}
          </div>
        </div>
      </div>

      {/* Day-wise Leads Graph */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Daily Leads Trend</h3>
        <div ref={chartScrollRef} className="h-64 overflow-x-auto">
          {(() => {
            const last7Days = Array.from({length: 30}, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              return date;
            });
            
            const dailyStats = last7Days.map(date => {
              const dayLeads = leads.filter(lead => {
                if (!lead.dateTime) return false;
                const leadDate = new Date(lead.dateTime);
                const targetDate = new Date(date);
                
                // Reset time to midnight for accurate date comparison
                leadDate.setHours(0, 0, 0, 0);
                targetDate.setHours(0, 0, 0, 0);
                
                return leadDate.getTime() === targetDate.getTime();
              });
              
              return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.getDate(),
                total: dayLeads.length,
                forwarded: dayLeads.filter(l => l.forwardedTo && l.forwardedTo !== '').length
              };
            });
            
            const maxCount = Math.max(...dailyStats.map(d => d.total), 1);
            
            return (
              <div className="flex items-end justify-between h-full gap-2 min-w-max">
                {dailyStats.map((day, index) => {
                  const currentDate = last7Days[index];
                  const dateString = currentDate.getFullYear() + '-' + 
                    String(currentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(currentDate.getDate()).padStart(2, '0');
                  return (
                    <div 
                      key={index} 
                      className="flex flex-col items-center flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onFilterByDate && onFilterByDate(dateString)}
                    >
                      <div className="flex flex-col items-center justify-end h-48 mb-2">
                        <div className="text-xs text-slate-600 mb-1">{day.total}</div>
                        <div 
                          className="bg-indigo-500 rounded-t w-8 min-h-[4px]"
                          style={{ height: `${(day.total / maxCount) * 180}px` }}
                        />
                        <div 
                          className="bg-emerald-500 rounded-t w-8 min-h-[2px] -mt-1"
                          style={{ height: `${(day.forwarded / maxCount) * 180}px` }}
                        />
                      </div>
                      <div className="text-xs text-slate-500 text-center">
                        <div>{day.day}</div>
                        <div>{day.date}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span>Total Leads</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Forwarded</span>
          </div>
        </div>
      </div>
      
      <PlaceFilterModal
        isOpen={showPlaceModal}
        onClose={() => setShowPlaceModal(false)}
        leads={leads}
        onSelectPlace={(place) => onFilterByPlace && onFilterByPlace(place)}
      />
      
      <CountryFilterModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
        leads={leads}
        onSelectCountry={(country) => onFilterByCountry && onFilterByCountry(country)}
      />
      
      <QualityFilterModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        leads={leads}
        onSelectQuality={(quality) => onFilterByQuality && onFilterByQuality(quality)}
      />
      
      <TeamFilterModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        leads={leads}
        onSelectTeam={(team) => onFilterByTeam && onFilterByTeam(team)}
      />
      
      <StatusFilterModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        leads={leads}
        onSelectStatus={(status) => onFilterByStatus && onFilterByStatus(status)}
      />
      
      <HourFilterModal
        isOpen={showHourModal}
        onClose={() => setShowHourModal(false)}
        leads={leads}
        onSelectHour={(hour) => onFilterByHour && onFilterByHour(hour)}
        hourGrouping={hourGrouping}
      />
      

    </div>
  );
};