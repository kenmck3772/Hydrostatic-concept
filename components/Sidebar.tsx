import React from 'react';
import { AppState } from '../types';

interface SidebarProps {
  currentTab: AppState;
  setTab: (tab: AppState) => void;
}

const WellTegraLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Neural Network Nodes (Blue Dots) */}
    <circle cx="20" cy="30" r="4" fill="#0ea5e9" opacity="0.8" />
    <circle cx="35" cy="15" r="5" fill="#0ea5e9" opacity="0.6" />
    <circle cx="45" cy="40" r="3" fill="#0ea5e9" opacity="0.9" />
    <circle cx="25" cy="50" r="6" fill="#0ea5e9" opacity="0.5" />
    
    {/* Head Silhouette (Line Art) */}
    <path 
      d="M45 10C55 10 65 15 75 25C80 32 85 45 75 60C70 68 75 80 80 85" 
      stroke="#0ea5e9" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      opacity="0.8"
    />
    <path 
      d="M45 10C40 10 35 12 30 15M45 10C50 15 55 25 55 35M55 35L75 25M55 35L45 40M30 15L45 40M30 15L20 30M20 30L25 50M25 50L45 40" 
      stroke="#0ea5e9" 
      strokeWidth="0.8" 
      strokeLinecap="round"
      opacity="0.5"
    />

    {/* Oil Rig Silhouette (Black) */}
    <path 
      d="M30 75H70M40 75V60H60V75M48 60V40H52V60M35 75L20 85M65 75L80 85M45 40H55" 
      stroke="white" 
      strokeWidth="2.5" 
    />
    <path 
      d="M30 75H70M40 75V60H60V75M48 60V40H52V60M35 75L20 85M65 75L80 85M45 40H55" 
      stroke="black" 
      strokeWidth="1.5" 
    />
  </svg>
);

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab }) => {
  const navItems = [
    { id: 'DASHBOARD' as AppState, label: 'Control Center', icon: '📡' },
    { id: 'LEARN' as AppState, label: 'Curriculum', icon: '📟' },
    { id: 'EXAM_PREP' as AppState, label: 'Exam Prep', icon: '📝' },
    { id: 'SIMULATOR' as AppState, label: 'Sim Lab', icon: '🕹️' },
    { id: 'BRIDGE' as AppState, label: 'Physics Lab', icon: '🧬' },
    { id: 'ASSESSMENT' as AppState, label: 'Skill Audit', icon: '🔍' },
    { id: 'MAPPER' as AppState, label: 'Path Finder', icon: '🛰️' },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/50 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-800/30">
        <div className="flex items-center space-x-3">
          <WellTegraLogo />
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-tighter leading-none italic uppercase">
              Well-Tegra
            </h1>
            <p className="text-[9px] text-blue-400 uppercase tracking-[0.4em] font-black mt-0.5">
              LEARNING
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all group relative overflow-hidden ${
              currentTab === item.id
                ? 'bg-slate-900 text-amber-500 border border-slate-800'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
            }`}
          >
            {currentTab === item.id && (
              <div className="absolute left-0 top-0 w-1 h-full bg-amber-500 shadow-[2px_0_10px_rgba(245,158,11,0.5)]"></div>
            )}
            <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${currentTab === item.id ? 'opacity-100' : 'opacity-40'}`}>
              {item.icon}
            </span>
            <span className="font-black text-[10px] uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        {/* User Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8"></div>
          <div className="flex items-center justify-between mb-3">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">System Status</p>
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-amber-500 font-black italic">
              L3
            </div>
            <div>
              <span className="text-[9px] font-black text-slate-300 block uppercase">BOB RAKER</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">Candidate Registration</span>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="px-2 pb-2">
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
            <p className="text-[7px] leading-relaxed text-slate-500 font-medium italic text-center uppercase tracking-tight">
              Concept Only. Not affiliated with any training center. Developed to enhance personal skill sets and technical domain mastery.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;