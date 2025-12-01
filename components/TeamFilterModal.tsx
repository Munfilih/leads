import React from 'react';
import { Lead } from '../types';
import { X, UserCheck } from 'lucide-react';
import { countByCaseInsensitive } from '../utils/caseInsensitiveUtils';

interface TeamFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectTeam: (team: string) => void;
}

export const TeamFilterModal: React.FC<TeamFilterModalProps> = ({ 
  isOpen, 
  onClose, 
  leads, 
  onSelectTeam 
}) => {
  if (!isOpen) return null;

  const teamStats = countByCaseInsensitive(
    leads.filter(l => l.forwardedTo && l.forwardedTo.trim() && l.forwardedTo.toLowerCase() !== 'removed'), 
    l => l.forwardedTo
  );

  const sortedTeams = Object.entries(teamStats)
    .sort(([,a], [,b]) => b - a);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck size={20} />
            Filter by Team
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-2">
            {sortedTeams.map(([team, count]) => (
              <button
                key={team}
                onClick={() => {
                  onSelectTeam(team);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
              >
                <span className="font-medium text-slate-900">{team}</span>
                <span className="text-sm text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};