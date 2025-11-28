import React from 'react';
import { Lead, LeadStatus, LeadCategory } from '../types';
import { Users, UserCheck, AlertTriangle, TrendingUp, MapPin, Building, Award, Clock } from 'lucide-react';

interface DashboardProps {
  leads: Lead[];
}

export const Dashboard: React.FC<DashboardProps> = ({ leads }) => {
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.currentStatus === LeadStatus.NEW).length,
    genuine: leads.filter(l => l.leadQuality === LeadCategory.HOT).length,
    won: leads.filter(l => l.currentStatus === LeadStatus.WON).length,
    qualified: leads.filter(l => l.currentStatus === LeadStatus.QUALIFIED).length,
    contacted: leads.filter(l => l.currentStatus === LeadStatus.CONTACTED).length,
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
      acc[lead.country] = (acc[lead.country] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topCountries = Object.entries(countryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Industry distribution
  const industryStats = leads.reduce((acc, lead) => {
    if (lead.businessIndustry) {
      acc[lead.businessIndustry] = (acc[lead.businessIndustry] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  const topIndustries = Object.entries(industryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const conversionRate = stats.total > 0 ? ((stats.won / stats.total) * 100).toFixed(1) : '0';

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
              <p className="text-sm font-medium text-slate-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-emerald-600">{conversionRate}%</p>
              <p className="text-xs text-slate-400 mt-1">{stats.won} won deals</p>
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Places
          </h3>
          <div className="space-y-3">
            {(() => {
              const placeStats = leads.reduce((acc, lead) => {
                if (lead.place) {
                  acc[lead.place] = (acc[lead.place] || 0) + 1;
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Peak Engagement Hours
          </h3>
          <div className="space-y-3">
            {(() => {
              const hourStats = leads.reduce((acc, lead) => {
                if (lead.dateTime) {
                  const hour = new Date(lead.dateTime).getHours();
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
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Team Distribution
          </h3>
          <div className="space-y-3">
            {(() => {
              const teamStats = leads.reduce((acc, lead) => {
                const team = lead.forwardedTo || 'Unassigned';
                if (!acc[team]) {
                  acc[team] = { total: 0, won: 0, genuine: 0 };
                }
                acc[team].total++;
                if (lead.currentStatus === LeadStatus.WON) acc[team].won++;
                if (lead.leadQuality === LeadCategory.HOT) acc[team].genuine++;
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
    </div>
  );
};