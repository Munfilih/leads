import React, { useState } from 'react';
import { LayoutDashboard, Users, Settings, Database, Plus, Menu, X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isAdminMode, setIsAdminMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'form', label: 'Add Lead', icon: Plus },
    { id: 'sheets', label: 'Sheet View', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center">
              <img src="/leads/favicon.png" alt="Z" className="w-8 h-8" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text -ml-1">
                awo Leads
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Leads Manager {isAdminMode && '(Admin)'}</p>
          </button>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {navItems.filter(item => isAdminMode || (item.id !== 'form' && item.id !== 'sheets' && item.id !== 'settings')).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <nav className="px-6 py-4 space-y-2">
            {navItems.filter(item => isAdminMode || (item.id !== 'form' && item.id !== 'sheets' && item.id !== 'settings')).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};