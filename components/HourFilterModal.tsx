import React from 'react';
import { Lead } from '../types';
import { X, Clock } from 'lucide-react';

interface HourFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onSelectHour: (hour: string) => void;
  hourGrouping?: 1 | 3 | 6 | 12;
}

export const HourFilterModal: React.FC<HourFilterModalProps> = ({ 
  isOpen, 
  onClose, 
  leads, 
  onSelectHour,
  hourGrouping = 1
}) => {
  if (!isOpen) return null;

  console.log('HourFilterModal hourGrouping:', hourGrouping);

  const hourStats = leads.reduce((acc, lead) => {
    if (lead.dateTime && lead.dateTime.trim()) {
      const hour = new Date(lead.dateTime.trim()).getHours();
      const groupedHour = Math.floor(hour / hourGrouping) * hourGrouping;
      
      const formatHour = (h: number) => {
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        return `${hour12}:00 ${ampm}`;
      };
      
      const endHour = groupedHour + hourGrouping;
      const timeRange = `${formatHour(groupedHour)} - ${formatHour(endHour % 24)}`;
      
      acc[timeRange] = (acc[timeRange] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedHours = Object.entries(hourStats)
    .sort(([,a], [,b]) => b - a);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} />
            Filter by Hour
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
            {sortedHours.map(([hour, count]) => (
              <button
                key={hour}
                onClick={() => {
                  onSelectHour(hour);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors text-left"
              >
                <span className="font-medium text-slate-900">{hour}</span>
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