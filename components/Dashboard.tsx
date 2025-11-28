import React, { useState } from 'react';
import { Lead, LeadStatus, LeadCategory } from '../types';
import { Users, UserCheck, AlertTriangle, TrendingUp, MapPin, Building, Award, Clock, Target } from 'lucide-react';
import { PlaceFilterModal } from './PlaceFilterModal';
import { CountryFilterModal } from './CountryFilterModal';
import { QualityFilterModal } from './QualityFilterModal';
import { TeamFilterModal } from './TeamFilterModal';
import { StatusFilterModal } from './StatusFilterModal';
import { HourFilterModal } from './HourFilterModal';


interface DashboardProps {
  leads: Lead[];
  onFilterByPlace?: (place: string) => void;
  onFilterByCountry?: (country: string) => void;
  onFilterByQuality?: (quality: string) => void;
  onFilterByTeam?: (team: string) => void;
  onFilterByStatus?: (status: string) => void;
  onFilterByHour?: (hour: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ leads, onFilterByPlace, onFilterByCountry, onFilterByQuality, onFilterByTeam, onFilterByStatus, onFilterByHour }) => {
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHourModal, setShowHourModal] = useState(false);
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.currentStatus === LeadStatus.NEW).length,
    genuine: leads.filter(l => l.leadQuality === 'Genuine' || l.leadQuality === 'GENUINE' || l.leadQuality === 'HOT' || l.leadQuality === LeadCategory.HOT).length,
    won: leads.filter(l => l.currentStatus === LeadStatus.WON).length,
    qualified: leads.filter(l => l.currentStatus === LeadStatus.QUALIFIED).length,
    contacted: leads.filter(l => l.currentStatus === LeadStatus.CONTACTED).length,
    forwarded: leads.filter(l => l.forwardedTo && l.forwardedTo !== '').length,
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
  const countryStats = leads.reduce((acc, lead) => {
    if (lead.country) {
      const trimmedCountry = lead.country.trim();
      acc[trimmedCountry] = (acc[trimmedCountry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Industry distribution
  const industryStats = leads.reduce((acc, lead) => {
    if (lead.businessIndustry) {
      const trimmedIndustry = lead.businessIndustry.trim();
      acc[trimmedIndustry] = (acc[trimmedIndustry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topIndustries = Object.entries(industryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const forwardRate = stats.total > 0 ? ((stats.forwarded / stats.total) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Genuine Leads</p>
              <p className="text-2xl font-bold text-green-600">{stats.genuine}</p>
              <p className="text-xs text-slate-400 mt-1">High quality leads</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Forward Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{forwardRate}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.forwarded} forwarded leads</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Pipeline</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new + stats.contacted + stats.qualified}</p>
              <p className="text-xs text-slate-400 mt-1">In progress</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">New</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.new/stats.total)*100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">{stats.new}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Contacted</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.contacted/stats.total)*100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">{stats.contacted}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Qualified</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.qualified/stats.total)*100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">{stats.qualified}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Won</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.total > 0 ? (stats.won/stats.total)*100 : 0}%`}}></div>
                </div>
                <span className="text-sm font-bold text-slate-900 w-8">{stats.won}</span>
              </div>
            </div>
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
              const placeStats = leads.reduce((acc, lead) => {
                if (lead.place) {
                  const trimmedPlace = lead.place.trim();
                  acc[trimmedPlace] = (acc[trimmedPlace] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>);
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
              const qualityStats = leads.reduce((acc, lead) => {
                if (lead.leadQuality) {
                  const trimmedQuality = lead.leadQuality.trim();
                  acc[trimmedQuality] = (acc[trimmedQuality] || 0) + 1;
                }
                return acc;
              }, {} as Record<string, number>);
              
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
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Peak Engagement Hours
          </h3>
          <div className="space-y-3">
            {(() => {
              const hourStats = leads.reduce((acc, lead) => {
                if (lead.dateTime && lead.dateTime.trim()) {
                  const hour = new Date(lead.dateTime.trim()).getHours();
                  acc[hour] = (acc[hour] || 0) + 1;
                }
                return acc;
              }, {} as Record<number, number>);
              
              const topHours = Object.entries(hourStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([hour, count]) => ({
                  hour: parseInt(hour),
                  count,
                  timeRange: `${hour.padStart(2, '0')}:00 - ${(parseInt(hour) + 1).toString().padStart(2, '0')}:00`
                }));

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
                const team = (lead.forwardedTo || 'Unassigned').trim();
                if (!acc[team]) {
                  acc[team] = { total: 0, won: 0, genuine: 0 };
                }
                acc[team].total++;
                if (lead.currentStatus === LeadStatus.WON) acc[team].won++;
                if (lead.leadQuality === 'Genuine' || lead.leadQuality === 'GENUINE' || lead.leadQuality === 'HOT' || lead.leadQuality === LeadCategory.HOT) acc[team].genuine++;
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
        <div className="h-64">
          {(() => {
            const last7Days = Array.from({length: 7}, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - i));
              return date;
            });
            
            const dailyStats = last7Days.map(date => {
              const dayLeads = leads.filter(lead => {
                if (!lead.dateTime) return false;
                const leadDate = new Date(lead.dateTime);
                return leadDate.toDateString() === date.toDateString();
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
              <div className="flex items-end justify-between h-full gap-2">
                {dailyStats.map((day, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
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
                ))}
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
      />
      

    </div>
  );
};