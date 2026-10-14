import React, { useState } from 'react';
import { Droplet, Plus, Menu, X, RotateCcw, Download } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'tracker' | 'leaks' | 'analytics' | 'goals_tips';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogModal: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogModal,
  onResetData,
  onExportData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'tracker', label: 'Usage Tracker' },
    { id: 'leaks', label: 'Leakage Reports' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'goals_tips', label: 'Goals & SDG 6' },
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element wordmark with brand drop icon */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white shadow-sm shrink-0">
              <Droplet className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              AquaSave
            </span>
          </button>

          {/* Zone 2: 5 single-line clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 font-medium ${
                    isActive
                      ? 'border-sky-600 text-sky-700'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA action + backup controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <button
                onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
                className="hidden lg:inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                title="Data Options"
              >
                Options
              </button>

              {menuDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 text-xs text-slate-700 z-50">
                  <button
                    onClick={() => {
                      setMenuDropdownOpen(false);
                      onExportData();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Backup / Export JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      setMenuDropdownOpen(false);
                      if (window.confirm('Reset all water data and logs to initial realistic demo state?')) {
                        onResetData();
                      }
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onOpenLogModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 focus:outline-none"
            >
              <Plus className="w-4 h-4" />
              <span>Log Water Activity</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none rounded-lg"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onExportData();
              }}
              className="hover:text-slate-900 py-1"
            >
              Export Backup
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.confirm('Reset all water data to demo state?')) {
                  onResetData();
                }
              }}
              className="hover:text-red-600 text-red-500 py-1"
            >
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
