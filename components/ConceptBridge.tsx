import React, { useState, useRef, useEffect } from 'react';
import { translateConcept } from '../services/geminiService';
import { ConceptTranslation } from '../types';

const WELL_ENGINEERING_CONCEPTS = [
  { id: 'hydrostatics', label: 'Hydrostatic Pressure', icon: '💧' },
  { id: 'hole_cleaning', label: 'Hole Cleaning', icon: '🧹' },
  { id: 'directional', label: 'Directional Drilling', icon: '🎯' },
  { id: 'gas_migration', label: 'Gas Migration', icon: '🫧' },
  { id: 'well_control', label: 'Well Control & BOP', icon: '🛑' },
  { id: 'mpd', label: 'Managed Pressure Drilling', icon: '🔄' },
  { id: 'hydraulics', label: 'Wellbore Hydraulics', icon: '🌊' },
  { id: 'casing', label: 'Casing & Tubing Design', icon: '🏗️' }
];

const SUGGESTED_HOBBIES = [
  "Scuba Diving", "F1 Car Hydraulics", "Aquarium Design", 
  "Residential Plumbing", "Mountain Biking", "Espresso Extraction", 
  "Tesla Autopilot", "Flight Simulators", "Sailing Navigation"
];

const FLUID_PRESETS = [
  { label: 'Oil', sg: 0.85, color: 'from-amber-700/90 via-amber-600/50 to-amber-500/20' },
  { label: 'Water', sg: 1.00, color: 'from-blue-600/90 via-blue-500/50 to-blue-400/20' },
  { label: 'Mud', sg: 1.25, color: 'from-slate-700/90 via-slate-600/50 to-slate-500/20' },
  { label: 'Brine', sg: 1.45, color: 'from-cyan-700/90 via-cyan-600/50 to-cyan-500/20' },
];

const HydrostaticVisualizer: React.FC = () => {
  const [depth, setDepth] = useState(75);
  const [density, setDensity] = useState(1.0); 
  const [showGrid, setShowGrid] = useState(true);
  const [probes, setProbes] = useState<{ x: number, y: number, id: number }[]>([]);
  const [hoverY, setHoverY] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'Simulation' | 'Theory' | 'Analogies'>('Simulation');
  const containerRef = useRef<HTMLDivElement>(null);

  const SG_TO_PPG = 8.33;
  const G_CONST = 0.052; 
  const TVD_ft = depth * 100; 
  const ppgValue = density * SG_TO_PPG;
  const hydrostaticP = Math.round(ppgValue * G_CONST * TVD_ft);

  const calculatePressureAtY = (y: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const h = rect.height;
    const fluidTop = h * (1 - depth / 100);
    const localDepthFraction = Math.max(0, (y - fluidTop) / (h * (depth / 100)));
    return Math.round(ppgValue * G_CONST * (localDepthFraction * TVD_ft));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const fluidTop = rect.height * (1 - depth / 100);
    if (y >= fluidTop) setHoverY(y);
    else setHoverY(null);
  };

  const handleAddProbe = (e: React.MouseEvent) => {
    if (!containerRef.current || hoverY === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setProbes(prev => [...prev.slice(-4), { x, y: hoverY, id: Date.now() }]);
  };

  const activePreset = FLUID_PRESETS.find(p => Math.abs(p.sg - density) < 0.05) || FLUID_PRESETS[1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white z-0">
        <span className="text-[16rem] font-black italic uppercase tracking-tighter leading-none">P = ρgh</span>
      </div>

      <div className="flex flex-col gap-4 flex-shrink-0 z-10">
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverY(null)}
          onClick={handleAddProbe}
          className="relative w-96 h-[55rem] bg-slate-950 border-4 border-slate-800 rounded-[3rem] overflow-hidden shadow-inner cursor-crosshair group flex"
        >
          {/* Surface Air */}
          <div className="absolute top-0 left-0 right-0 bg-slate-900/50 flex flex-col items-center justify-center border-b border-white/5 transition-all duration-700 z-10" style={{ height: `${100 - depth}%` }}>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-8 text-center">Surface Atmosphere (Zero Hydrostatic Head)</span>
          </div>

          {/* Depth Gauge */}
          <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/5 flex flex-col justify-between py-10 z-20">
             {Array.from({ length: 6 }).map((_, i) => (
               <span key={i} className="text-[7px] font-black text-slate-600 font-mono text-center">{(5 - i) * 2000}ft</span>
             ))}
          </div>

          {/* Fluid Column Container */}
          <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${activePreset.color} transition-all duration-700 ease-out`} style={{ height: `${depth}%` }}>
            
            {/* ENHANCED: Literal Gravity Stack Grid */}
            {showGrid && (
              <div className="absolute inset-0 flex flex-col pointer-events-none z-10">
                {Array.from({ length: 10 }).map((_, i) => {
                  const segmentTVD = Math.round((i + 1) * TVD_ft / 10);
                  const cumulativePressure = Math.round(ppgValue * G_CONST * segmentTVD);
                  const layerContribution = Math.round(ppgValue * G_CONST * (TVD_ft / 10));
                  const stressIntensity = (i + 1) / 10;

                  return (
                    <div key={i} className="flex-1 border-b border-white/5 relative group/segment flex flex-col items-center justify-center">
                      {/* Literal Weight Stacking Visualization */}
                      <div 
                        className="absolute inset-x-4 bottom-2 rounded-xl bg-blue-500/10 border border-blue-400/20 backdrop-blur-[2px] transition-all duration-500 flex items-center justify-between px-6" 
                        style={{ top: '4px', opacity: 0.3 + (i * 0.07) }}
                      >
                         <div className="flex flex-col">
                            <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Weight Layer {i+1}</span>
                            <span className="text-[10px] font-mono text-white/60 font-black">+{layerContribution} PSI</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-[6px] font-black text-slate-500 uppercase">Load from Above</span>
                            <span className="text-[12px] font-mono text-blue-400 font-black">Σ {cumulativePressure} PSI</span>
                         </div>
                      </div>

                      {/* Wall Burst Stress Indicators */}
                      <div className="absolute inset-y-0 left-0 w-1.5 bg-red-500 transition-all duration-700 shadow-[2px_0_15px_rgba(239,68,68,0.5)]" style={{ opacity: stressIntensity * 0.8 }}></div>
                      <div className="absolute inset-y-0 right-0 w-1.5 bg-red-500 transition-all duration-700 shadow-[-2px_0_15px_rgba(239,68,68,0.5)]" style={{ opacity: stressIntensity * 0.8 }}></div>
                      
                      {/* Pressure Vector Arrows (Pascal's Law Visualization) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                         {/* Downward Force */}
                         <div className="absolute flex flex-col items-center" style={{ bottom: '10%', height: `${20 + i * 5}%` }}>
                            <div className="w-0.5 bg-white flex-1"></div>
                            <div className="w-2 h-2 border-b border-r border-white rotate-45 -mt-2"></div>
                         </div>
                         {/* Omnidirectional Lateral Force (Pascal's Law) */}
                         <div className="absolute flex items-center justify-between w-full px-1">
                            <div className="flex items-center">
                               <div className="w-2 h-2 border-l border-t border-white rotate-[-45deg] -mr-1"></div>
                               <div className="h-0.5 bg-white" style={{ width: `${10 + i * 5}px` }}></div>
                            </div>
                            <div className="flex items-center">
                               <div className="h-0.5 bg-white" style={{ width: `${10 + i * 5}px` }}></div>
                               <div className="w-2 h-2 border-r border-t border-white rotate-45 -ml-1"></div>
                            </div>
                         </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pressure Wedge Profile */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-slate-950/30 border-r border-white/5 overflow-hidden z-10">
               <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path 
                    d={`M 0,0 L 100,100 L 0,100 Z`} 
                    className="fill-blue-500/20 stroke-blue-400/40 stroke-[1] transition-all duration-700"
                 />
                 <text x="50" y="30" textAnchor="middle" className="fill-blue-400 font-black text-[6px] uppercase tracking-tighter opacity-40">Cumulative Column Mass</text>
               </svg>
            </div>

            {/* Interactive Probes */}
            {probes.map(p => {
              const pressure = calculatePressureAtY(p.y);
              const fluidTopY = (containerRef.current?.getBoundingClientRect().height || 0) * (1 - depth/100);
              return (
                <div key={p.id} className="absolute z-30" style={{ left: p.x, top: p.y - fluidTopY }}>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                      <div key={angle} className="absolute h-0.5 bg-amber-500/80 origin-left transition-all duration-500 animate-pulse" style={{ transform: `rotate(${angle}deg)`, width: `${12 + pressure * 0.03}px`, animationDelay: `${angle * 2}ms` }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-t border-amber-400 rotate-45"></div>
                      </div>
                    ))}
                  </div>
                  <div className="w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] border-2 border-amber-500 absolute scale-125"></div>
                  <div className="bg-slate-950 border-2 border-amber-500/50 px-3 py-1.5 rounded-xl backdrop-blur-xl -translate-y-16 -translate-x-1/2 shadow-2xl min-w-[80px] text-center">
                     <span className="text-[12px] font-black text-white font-mono block leading-none">{pressure}</span>
                     <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest">PSI @ DEPTH</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowGrid(!showGrid)} className={`p-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${showGrid ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
            {showGrid ? 'Hide Weight Stack' : 'Show Weight Stack'}
          </button>
          <button onClick={() => setProbes([])} className="p-4 bg-slate-800 rounded-2xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 transition-all">Clear Data Probes</button>
        </div>
      </div>

      <div className="flex-1 space-y-8 z-10 flex flex-col">
        <div className="flex bg-slate-950 p-2 rounded-3xl border border-slate-800 gap-2">
           {['Simulation', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {viewMode === 'Simulation' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-inner">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">1. Fluid Density (ρ)</label>
                     <input type="range" min="0.5" max="2.0" step="0.05" value={density} onChange={(e) => setDensity(parseFloat(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">Density:</span><span className="text-blue-400">{density.toFixed(2)} SG</span></div>
                  </div>
                  <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-inner">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">2. Vertical Height (h)</label>
                     <input type="range" min="10" max="100" value={depth} onChange={(e) => setDepth(parseInt(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">TVD:</span><span className="text-white">{TVD_ft} ft</span></div>
                  </div>
               </div>
               <div className="bg-slate-950 p-12 rounded-[4rem] border border-slate-800 shadow-2xl relative overflow-hidden group text-center">
                  <div className="absolute top-0 left-0 w-3 h-full bg-amber-500"></div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mb-2 block">Total Stacked Weight (Bottom)</span>
                  <h4 className="text-[10rem] font-black text-white italic tracking-tighter leading-none">{hydrostaticP}</h4>
                  <div className="mt-4 flex justify-center gap-4 text-slate-400">
                     <span className="bg-red-500/10 text-red-400 px-4 py-1 rounded-lg text-[10px] font-black uppercase italic">High Pressure Zone (Burst Stress)</span>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Theory' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
               <div className="bg-slate-950 p-20 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden shadow-inner group">
                  <h5 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.6em] mb-16 italic">The Governing Physical Law</h5>
                  <h4 className="text-[12rem] font-black text-white italic tracking-tighter leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-8">P = ρgh</h4>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Pressure = Density × Gravity × Height</p>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] shadow-xl space-y-8">
                  <div className="border-l-4 border-amber-500 pl-8">
                    <h4 className="text-[12px] font-black text-amber-500 uppercase tracking-[0.5em] mb-4 italic">Pascal's Law: Omnidirectionality</h4>
                    <p className="text-slate-200 text-lg leading-relaxed font-medium italic">
                      The defining characteristic of hydrostatic pressure is that it <span className="text-white font-bold underline decoration-amber-500 underline-offset-8 decoration-4">acts equally in all directions</span> at a given depth. 
                    </p>
                  </div>
                  <p className="text-slate-400 text-base leading-relaxed">
                    While the *source* of the pressure is the vertical weight of the fluid column above (gravity), the resulting pressure is not just a downward force. It pushes against the casing walls, the drill pipe, and the bottom of the hole with equal intensity. In well engineering, we must account for this "Burst Stress" on our tubulars.
                  </p>
               </div>
            </div>
          )}

          {viewMode === 'Analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-10 duration-700">
               {[
                 { 
                   title: 'Scuba Diving', 
                   icon: '🤿', 
                   color: 'text-blue-400', 
                   desc: 'At the surface, you feel 1 atmosphere. Dive to 33ft, and the weight of the water above adds 1 more. Your eardrums feel this cumulative stack increasing equally from all sides, requiring you to equalize.',
                   math: 'P_abs = P_atm + P_fluid'
                 },
                 { 
                   title: 'Aquarium Design', 
                   icon: '🐠', 
                   color: 'text-emerald-400', 
                   desc: 'Glass thickness for a 100-gallon aquarium is determined by the *water level* height, not the total volume. A tall, narrow tank needs thicker glass at the base than a long, shallow one due to the head pressure.',
                   math: 'Stress ∝ Vertical Head'
                 },
                 { 
                   title: 'F1 Car Hydraulics', 
                   icon: '🏎️', 
                   color: 'text-red-500', 
                   desc: 'Brake fluid in F1 lines uses the principle that pressure is transmitted instantly and equally. While the system is pressurized by a piston, the fluid behaves like a column of intense energy seeking any path out.',
                   math: 'Force = Pressure × Area'
                 },
                 { 
                   title: 'Residential Plumbing', 
                   icon: '🚰', 
                   color: 'text-cyan-400', 
                   desc: 'In skyscrapers, ground floor pipes handle immense "Static Head" compared to the penthouse. Opening a faucet releases this energy into flow; if the pipe walls can\'t handle the stress, they burst.',
                   math: 'ΔP = SG × 0.433 × ΔH'
                 }
               ].map((a) => (
                 <div key={a.title} className="bg-slate-950 p-8 rounded-[3rem] border border-slate-800 shadow-2xl group hover:border-amber-500/50 transition-all flex flex-col text-center items-center relative overflow-hidden">
                    <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform duration-500">{a.icon}</div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${a.color} mb-4`}>{a.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-200 mb-8 flex-1">
                      {a.desc}
                    </p>
                    <div className="mt-auto bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                      <code className="text-[9px] font-mono text-amber-500 font-bold">{a.math}</code>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HoleCleaningVisualizer: React.FC = () => {
  const [flowRate, setFlowRate] = useState(450);
  const [viscosity, setViscosity] = useState(35);
  const [inclination, setInclination] = useState(0);
  const [particleSize, setParticleSize] = useState(5);
  const [viewMode, setViewMode] = useState<'Simulation' | 'Theory' | 'Analogies'>('Simulation');

  const ANNULAR_AREA = 35.5; 
  const annularVelocity = (flowRate * 24.5) / ANNULAR_AREA;
  
  const slipVelocity = (Math.pow(particleSize, 1.5) * 25) / (viscosity / 2); 
  
  const angleRad = (inclination * Math.PI) / 180;
  const verticalSlip = slipVelocity * Math.cos(angleRad);
  const inclinationEffect = Math.sin(angleRad) * 40;
  
  const netVelocity = annularVelocity - verticalSlip - (inclination > 45 ? inclinationEffect : 0);
  const transportEfficiency = Math.max(0, Math.min(1, netVelocity / (annularVelocity || 1)));
  
  const isStuck = transportEfficiency < 0.2 || (inclination > 60 && flowRate < 450) || (viscosity < 25 && particleSize > 8);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white z-0">
        <span className="text-[14rem] font-black italic uppercase tracking-tighter leading-none">Vnet = Va - Vs</span>
      </div>

      <div className="flex flex-col gap-4 flex-shrink-0 z-10">
        <div className="relative w-80 h-[50rem] bg-slate-950 border-4 border-slate-800 rounded-[3rem] overflow-hidden shadow-inner flex flex-col items-center">
           <div className="flex-1 w-32 border-x-8 border-slate-700 bg-slate-900/40 relative overflow-hidden transition-transform duration-1000 ease-in-out origin-top" style={{ transform: `rotate(${inclination}deg)` }}>
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-12 bg-slate-800 border-x-4 border-slate-700 opacity-60"></div>
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>

              {!isStuck ? (
                Array.from({ length: Math.floor(transportEfficiency * 30 + 5) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-amber-600 rounded-sm shadow-[0_0_8px_rgba(217,119,6,0.4)]" 
                    style={{ 
                      width: `${particleSize}px`, 
                      height: `${particleSize}px`, 
                      left: `${Math.random() * 60 + 20}%`, 
                      bottom: '-10%', 
                      animation: `cuttingsRise ${8 / (transportEfficiency + 0.1)}s linear infinite`, 
                      animationDelay: `${Math.random() * 5}s`,
                      opacity: 0.8 + Math.random() * 0.2
                    }}
                  ></div>
                ))
              ) : (
                <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-amber-900/90 to-transparent flex flex-col items-center justify-end pb-8">
                   <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/sandpaper.png')] opacity-30"></div>
                   <span className="text-[12px] font-black text-red-500 uppercase animate-pulse mb-2">Dune Formation</span>
                   <span className="text-[8px] font-black text-red-400 uppercase tracking-widest italic">Critical Saltation Velocity</span>
                </div>
              )}

              <div className="absolute top-10 right-4 flex flex-col items-center gap-2">
                 <div className="w-1 bg-blue-400 rounded-full transition-all duration-500" style={{ height: `${annularVelocity / 5}px` }}></div>
                 <span className="text-[6px] font-black text-blue-400 uppercase rotate-90">Va</span>
              </div>
           </div>
        </div>
        <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 text-center">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block italic">Transport Efficiency</span>
           <div className={`text-4xl font-black italic font-mono transition-colors duration-500 ${transportEfficiency < 0.3 ? 'text-red-500' : transportEfficiency < 0.7 ? 'text-amber-500' : 'text-emerald-500'}`}>
             {Math.round(transportEfficiency * 100)}%
           </div>
        </div>
      </div>

      <div className="flex-1 space-y-8 z-10 flex flex-col">
        <div className="flex bg-slate-950 p-2 rounded-3xl border border-slate-800 gap-2">
           {['Simulation', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {viewMode === 'Simulation' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-inner relative group">
                     <div className="absolute top-4 right-6 text-2xl opacity-10">🌊</div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">1. Flow Rate (GPM)</label>
                     <input type="range" min="0" max="1200" step="50" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">Value:</span><span className="text-blue-400">{flowRate} GPM</span></div>
                  </div>
                  
                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-inner relative group">
                     <div className="absolute top-4 right-6 text-2xl opacity-10">🍯</div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">2. Viscosity (cP)</label>
                     <input type="range" min="10" max="100" step="5" value={viscosity} onChange={(e) => setViscosity(Number(e.target.value))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">Rheology:</span><span className="text-amber-500">{viscosity} cP</span></div>
                  </div>

                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-inner relative group">
                     <div className="absolute top-4 right-6 text-2xl opacity-10">📐</div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">3. Well Inclination (°)</label>
                     <input type="range" min="0" max="90" value={inclination} onChange={(e) => setInclination(Number(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">Angle:</span><span className="text-emerald-500">{inclination}°</span></div>
                  </div>

                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-inner relative group">
                     <div className="absolute top-4 right-6 text-2xl opacity-10">🪨</div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic block">4. Cutting Size (mm)</label>
                     <input type="range" min="1" max="15" step="1" value={particleSize} onChange={(e) => setParticleSize(Number(e.target.value))} className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                     <div className="flex justify-between text-xs font-mono font-bold"><span className="text-slate-500">Diameter:</span><span className="text-slate-400">{particleSize} mm</span></div>
                  </div>
               </div>

               <div className="bg-slate-950 p-12 rounded-[4rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-[length:20px_20px]"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                     <div className="text-left space-y-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 block">Mechanical Analysis</span>
                        <p className="text-xl font-bold text-white italic leading-tight">
                           {isStuck ? "Critical Risk: Cuttings are accumulating in the wellbore faster than they are being removed." : "Optimal Transport: Fluid energy successfully overcomes particle slip velocity."}
                        </p>
                        <div className="flex gap-4">
                           <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl">
                              <span className="text-[8px] font-black text-blue-400 uppercase block">Annular Velocity</span>
                              <span className="text-sm font-black text-white">{Math.round(annularVelocity)} ft/min</span>
                           </div>
                           <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                              <span className="text-[8px] font-black text-red-400 uppercase block">Slip Velocity</span>
                              <span className="text-sm font-black text-white">{Math.round(slipVelocity)} ft/min</span>
                           </div>
                        </div>
                     </div>
                     <div className="w-48 h-48 bg-slate-900 rounded-full border-8 border-slate-800 flex items-center justify-center relative shadow-inner shrink-0">
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
                           <div className="w-full h-full bg-blue-500/10 animate-pulse"></div>
                        </div>
                        <span className={`text-5xl font-black italic tracking-tighter transition-colors duration-500 ${isStuck ? 'text-red-500' : 'text-emerald-500'}`}>
                           {Math.round(transportEfficiency * 100)}%
                        </span>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Theory' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-700">
               <div className="bg-slate-950 p-20 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden shadow-inner group">
                  <h5 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.6em] mb-16 italic">The Dynamic Balance</h5>
                  <h4 className="text-[14rem] font-black text-white italic tracking-tighter leading-none opacity-10 absolute inset-0 flex items-center justify-center pointer-events-none">Vnet</h4>
                  <div className="relative z-10 flex flex-col items-center gap-4">
                     <span className="text-6xl font-black text-white tracking-tighter italic">Vnet = Va - Vs</span>
                     <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest max-w-xs">
                        Net Velocity equals Annular Velocity minus Slip Velocity.
                     </p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl space-y-4">
                     <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest italic">The Boycott Effect</h4>
                     <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                        In inclined wellbores, gravity causes cuttings to settle on the low side of the hole over a much shorter distance than in vertical wells. Once they settle, they form "dunes" or beds which are much harder to lift than suspended particles.
                     </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-xl space-y-4">
                     <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest italic">Fluid Rheology (YP/PV)</h4>
                     <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                        Yield Point (YP) represents the fluid's ability to "carry" solids. High YP helps keep cuttings in suspension when circulation stops, while Plastic Viscosity (PV) relates more to the friction of the fluid moving.
                     </p>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700">
               {[
                 { 
                   title: 'The Vacuum Cleaner', 
                   icon: '🧹', 
                   color: 'text-blue-400', 
                   desc: 'To suck up heavy debris, you need high "suction" (Flow Rate). If you try to vacuum a pebble with a low-power setting, it just rattles in the tube—that\'s a particle with high slip velocity.' 
                 },
                 { 
                   title: 'Leaf Blower in a Tunnel', 
                   icon: '🍂', 
                   color: 'text-amber-500', 
                   desc: 'Imagine blowing leaves up a hill. If the hill is too steep (Inclination), the leaves roll back down even with a strong breeze. You have to maintain high wind speed (Va) to keep them moving forward.' 
                 },
                 { 
                   title: 'River Siltation', 
                   icon: '🌊', 
                   color: 'text-emerald-400', 
                   desc: 'A fast-moving mountain stream carries boulders. A slow-moving river only carries fine sand. When the river slows down (Pumps off), the boulders drop to the bottom first.' 
                 },
                 { 
                   title: 'The Honey Pour', 
                   icon: '🍯', 
                   color: 'text-red-400', 
                   desc: 'Drop a marble in water vs honey. In water, it falls instantly (Low Viscosity/High Slip). In honey, it descends slowly (High Viscosity/Low Slip). We engineer mud to be "honey-like" to carry cuttings.' 
                 }
               ].map((a) => (
                 <div key={a.title} className="bg-slate-950 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl group hover:border-amber-500 transition-all flex flex-col items-center text-center relative overflow-hidden">
                    <div className="text-7xl mb-10 group-hover:scale-125 transition-transform duration-500">{a.icon}</div>
                    <span className={`text-[12px] font-black uppercase tracking-widest ${a.color} mb-6 block`}>{a.title}</span>
                    <p className="text-sm text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-200">
                       {a.desc}
                    </p>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes cuttingsRise { 
          from { transform: translateY(0); opacity: 0; } 
          10% { opacity: 1; } 
          90% { opacity: 1; } 
          100% { transform: translateY(-800px); opacity: 0; } 
        }
      `}</style>
    </div>
  );
};

const DirectionalDrillingVisualizer: React.FC = () => {
  const [buildRate, setBuildRate] = useState(3.0); 
  const [turnRate, setTurnRate] = useState(0.0); 
  const [segments, setSegments] = useState(25);
  const [viewMode, setViewMode] = useState<'Steering' | 'BHA Tools' | 'Theory' | 'Analogies'>('Steering');

  const generatePath = () => {
    let points = [{ x: 50, y: 0, z: 0, inc: 0, azm: 0 }];
    const segmentMD = 50; 
    for (let i = 1; i <= segments; i++) {
      const prev = points[i - 1];
      const dInc = buildRate * (segmentMD / 100);
      const dAzm = turnRate * (segmentMD / 100);
      const newInc = prev.inc + dInc;
      const newAzm = prev.azm + dAzm;
      const avgInc = ((prev.inc + newInc) / 2) * (Math.PI / 180);
      const avgAzm = ((prev.azm + newAzm) / 2) * (Math.PI / 180);
      const visualScale = 15; 
      points.push({
        x: prev.x + (Math.sin(avgInc) * Math.sin(avgAzm)) * visualScale,
        y: prev.y + (Math.sin(avgInc) * Math.cos(avgAzm)) * visualScale,
        z: prev.z + (Math.cos(avgInc)) * visualScale,
        inc: newInc,
        azm: newAzm
      });
    }
    return points;
  };

  const path = generatePath();
  const lastPoint = path[path.length - 1];
  const dls = Math.sqrt(Math.pow(buildRate, 2) + Math.pow(turnRate * Math.sin(lastPoint.inc * Math.PI / 180), 2)).toFixed(2);
  const isHighDLS = parseFloat(dls) > 6.0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white z-0">
        <span className="text-[14rem] font-black italic uppercase tracking-tighter leading-none">TRAJECTORY</span>
      </div>

      <div className="flex flex-col gap-6 flex-shrink-0 z-10 w-full lg:w-[400px]">
        <div className="relative h-[35rem] bg-slate-950 border-4 border-slate-800 rounded-[3rem] overflow-hidden shadow-inner flex flex-col">
          <div className="flex-1 relative border-b border-slate-800 p-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/5 to-transparent">
            <span className="absolute top-4 left-6 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Profile View (Z vs Y)</span>
            <svg className="w-full h-full" viewBox="0 0 200 450">
               <path d={`M 100 0 ${path.map(p => `L ${100 + p.y} ${p.z}`).join(' ')}`} fill="none" stroke="#0ea5e9" strokeWidth="12" strokeLinecap="round" className="transition-all duration-700" />
               <circle cx={100 + lastPoint.y} cy={lastPoint.z} r="10" fill="#f59e0b" className="animate-pulse shadow-lg" />
               <ellipse cx="150" cy="420" rx="40" ry="15" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
               <text x="150" y="445" textAnchor="middle" className="fill-green-500 text-[10px] font-black uppercase">Target Reservoir</text>
            </svg>
          </div>
          <div className="h-44 relative p-6 bg-slate-950/80">
            <span className="absolute top-4 left-6 text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Plan View (X vs Y)</span>
            <svg className="w-full h-full" viewBox="0 0 100 100">
               <path d={`M 50 50 ${path.map(p => `L ${50 + p.x - 50} ${50 + p.y}`).join(' ')}`} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray="4 2" />
               <circle cx="50" cy="50" r="4" fill="#0ea5e9" />
               <circle cx={50 + lastPoint.x - 50} cy={50 + lastPoint.y} r="5" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
           <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Dogleg Severity (DLS)</span>
                <span className="text-[8px] text-slate-600 uppercase">Tortuosity Index</span>
              </div>
              <span className={`text-3xl font-black font-mono tracking-tighter ${isHighDLS ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`}>{dls}° <span className="text-[10px]">/100ft</span></span>
           </div>
           <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div className={`h-full transition-all duration-700 rounded-full shadow-lg ${isHighDLS ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (parseFloat(dls) / 12) * 100)}%` }}></div>
           </div>
           <p className="text-[9px] text-slate-500 font-bold uppercase text-center italic">Limit DLS to avoid casing stress and tool failure</p>
        </div>
      </div>

      <div className="flex-1 space-y-8 z-10">
        <div className="flex bg-slate-950 p-2 rounded-3xl border border-slate-800 gap-2 shadow-2xl">
           {['Steering', 'BHA Tools', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-xl scale-105' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto max-h-[45rem] pr-2 custom-scrollbar">
          {viewMode === 'Steering' && (
            <div className="space-y-8 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-4xl opacity-[0.02] font-black italic">CONTROL</div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block italic mb-6">Vertical Vector (Build/Drop)</label>
                    <div className="space-y-8">
                       <div className="flex justify-between items-center"><span className="text-[10px] font-black text-white uppercase">Inc Rate</span><span className="text-blue-400 font-mono font-bold">{buildRate}°/100ft</span></div>
                       <input type="range" min="-12" max="12" step="0.5" value={buildRate} onChange={(e) => setBuildRate(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                       <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest"><span>Full Drop</span><span>Steady</span><span>Full Build</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 space-y-8 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-4xl opacity-[0.02] font-black italic">BEARING</div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block italic mb-6">Horizontal Vector (Turn/Walk)</label>
                    <div className="space-y-8">
                       <div className="flex justify-between items-center"><span className="text-[10px] font-black text-white uppercase">Azm Rate</span><span className="text-amber-500 font-mono font-bold">{turnRate}°/100ft</span></div>
                       <input type="range" min="-8" max="8" step="0.5" value={turnRate} onChange={(e) => setTurnRate(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                       <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest"><span>Turn Left</span><span>Hold</span><span>Turn Right</span></div>
                    </div>
                  </div>
               </div>

               <div className="bg-blue-500/5 p-12 rounded-[4rem] border border-blue-500/20 flex flex-col md:flex-row items-center gap-12 group hover:border-blue-500/40 transition-colors">
                  <div className="w-24 h-24 bg-blue-500 rounded-3xl flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(59,130,246,0.3)] shrink-0 group-hover:rotate-12 transition-transform">🧭</div>
                  <div className="space-y-4">
                     <h5 className="text-blue-400 font-black text-xs uppercase tracking-[0.4em] italic">Measurement While Drilling (MWD)</h5>
                     <p className="text-base text-slate-400 leading-relaxed font-medium">
                        MWD acts as your <span className="text-white font-bold italic underline decoration-blue-500 underline-offset-4">Underwater GPS</span>. It uses magnetometers and accelerometers to send real-time coordinates through mud pulses. Without MWD, you are "flying blind" in 3D rock space.
                     </p>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'BHA Tools' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-right-10 duration-700">
               <div className="bg-slate-950 p-12 rounded-[4rem] border border-slate-800 shadow-2xl flex flex-col items-center group">
                  <div className="w-20 h-96 bg-slate-900 border-x-8 border-slate-700 relative flex flex-col items-center overflow-hidden rounded-full shadow-inner">
                     <div className="h-32 w-full bg-blue-500/10 border-b-2 border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400 uppercase rotate-90">MWD Package</div>
                     <div className="flex-1 w-full bg-amber-500/10 border-b-2 border-amber-500/30 flex items-center justify-center text-[10px] font-black text-amber-500 uppercase rotate-90">Rotary Steerable</div>
                     <div className="h-20 w-full bg-slate-800 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-amber-500 rounded-full animate-spin-slow"></div>
                     </div>
                  </div>
                  <h5 className="mt-10 text-[12px] font-black text-white uppercase italic tracking-[0.3em]">Advanced BHA Stack</h5>
               </div>
               <div className="space-y-6 flex flex-col justify-center">
                  <div className="p-10 bg-slate-900/50 rounded-[3rem] border border-slate-800 shadow-xl group hover:border-blue-500/50 transition-all">
                     <h6 className="text-[10px] font-black text-blue-400 uppercase mb-4 tracking-widest italic">The Navigator: MWD</h6>
                     <p className="text-sm text-slate-400 leading-relaxed font-medium italic">Continuously transmits surveys (Inclination/Azimuth) to surface using mud-pulse telemetry. It tells the driller <span className="text-white font-bold">WHERE</span> the bit is.</p>
                  </div>
                  <div className="p-10 bg-slate-900/50 rounded-[3rem] border border-slate-800 shadow-xl group hover:border-amber-500/50 transition-all">
                     <h6 className="text-[10px] font-black text-amber-400 uppercase mb-4 tracking-widest italic">The Pilot: RSS</h6>
                     <p className="text-sm text-slate-400 leading-relaxed font-medium italic">Rotary Steerable Systems allow the bit to steer while the entire string is <span className="text-white font-bold italic">rotating</span>. Uses automated pads or internal mandrels to dictate <span className="text-white font-bold">HOW</span> to turn.</p>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Theory' && (
            <div className="space-y-10 animate-in slide-in-from-left-10 duration-700">
               <div className="bg-slate-950 p-24 rounded-[5rem] border border-slate-800 text-center relative overflow-hidden shadow-2xl">
                  <h4 className="text-[14rem] font-black text-white italic tracking-tighter leading-none opacity-5 select-none absolute inset-0 flex items-center justify-center">AXIS</h4>
                  <h5 className="text-[14px] font-black text-blue-500 uppercase tracking-[0.6em] mb-16 italic">The 3D Coordinate Engine</h5>
                  <div className="flex justify-center gap-24 relative z-10">
                     <div className="flex flex-col items-center"><span className="text-6xl font-black text-white italic tracking-tighter">Inc</span><span className="text-[9px] uppercase text-slate-500 tracking-[0.3em] mt-4">Vertical Tilt</span></div>
                     <div className="flex flex-col items-center"><span className="text-6xl font-black text-white italic tracking-tighter">Azm</span><span className="text-[9px] uppercase text-slate-500 tracking-[0.3em] mt-4">Compass Bearing</span></div>
                     <div className="flex flex-col items-center"><span className="text-6xl font-black text-amber-500 italic tracking-tighter">TVD</span><span className="text-[9px] uppercase text-slate-500 tracking-[0.3em] mt-4">Vertical Depth</span></div>
                  </div>
               </div>
               <div className="bg-slate-900 border border-slate-800 p-16 rounded-[4rem] shadow-2xl relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 text-4xl opacity-[0.03] font-black italic">GEOMETRY</div>
                  <h4 className="text-[12px] font-black text-amber-500 uppercase tracking-[0.6em] mb-10 italic">Dogleg Intensity</h4>
                  <p className="text-slate-300 text-xl leading-relaxed font-medium mb-8 italic">
                     Steering is the art of <span className="text-white font-bold underline decoration-amber-500 underline-offset-8 decoration-4">Controlled Deviation</span>. You don't drill straight lines to the target; you follow an engineered arc (catenary curve) to minimize torque and drag.
                  </p>
               </div>
            </div>
          )}

          {viewMode === 'Analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700">
               {[
                 { title: 'Tesla Autopilot', icon: '🏎️', color: 'text-red-500', desc: 'Rotary Steerable (RSS) is your autonomous Lane-Keep Assist. It automatically maintains the bit\'s trajectory and adjusts for rock hardness while the whole vehicle (drill string) is spinning at top speed.' },
                 { title: 'Flight Simulator', icon: '✈️', color: 'text-emerald-400', desc: 'Drilling is instrument-only flight. Inclination is your "Pitch" (Altitude gain) and Azimuth is your "Heading" (Bearing). You manage these two vectors to land the bit in a thin reservoir target.' },
                 { title: 'Deep Sea Navigation', icon: '⛵', color: 'text-blue-400', desc: 'MWD surveys are like checking your position via GPS in the middle of the ocean. You periodically correct your course to account for "drift" (walk) and ensure you reach the port (target).' },
                 { title: 'Joystick Gaming', icon: '🎮', color: 'text-amber-500', desc: 'Directional drilling is like playing a game with 10km of lag. Every steering command takes hours to physically manifest at the bit. You have to "feel" the rock and anticipate the curve.' }
               ].map((a) => (
                 <div key={a.title} className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl group hover:border-amber-500 transition-all text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="text-7xl mb-10 group-hover:scale-125 transition-transform duration-500 group-hover:rotate-6">{a.icon}</div>
                    <span className={`text-[12px] font-black uppercase tracking-widest ${a.color} mb-6 block`}>{a.title}</span>
                    <p className="text-[13px] text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-200">{a.desc}</p>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const ConceptBridge: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState(WELL_ENGINEERING_CONCEPTS[0]);
  const [hobby, setHobby] = useState('');
  const [loading, setLoading] = useState(false);
  const [translation, setTranslation] = useState<ConceptTranslation | null>(null);

  const handleTranslate = async () => {
    if (!hobby) return;
    setLoading(true);
    try {
      const result = await translateConcept(selectedConcept.label, hobby);
      setTranslation(result);
    } catch (error) {
      console.error(error);
      alert('Synthesis failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="border-b border-slate-800 pb-12">
        <div className="flex items-center space-x-4 mb-4">
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Module: Physics Translation Engine</span>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">Physics <span className="text-slate-600">Lab</span></h1>
        <p className="text-slate-400 font-medium max-w-2xl text-lg leading-snug">Bridge your personal expertise with complex well engineering principles through interactive synthesis.</p>
      </header>

      {selectedConcept.id === 'hydrostatics' && <HydrostaticVisualizer />}
      {selectedConcept.id === 'hole_cleaning' && <HoleCleaningVisualizer />}
      {selectedConcept.id === 'directional' && <DirectionalDrillingVisualizer />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
        <div className="lg:col-span-4 space-y-3">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Select Domain Concept</p>
          <div className="grid grid-cols-1 gap-2">
            {WELL_ENGINEERING_CONCEPTS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConcept(c)}
                className={`w-full p-5 rounded-2xl text-left transition-all border group relative flex items-center gap-4 ${
                  selectedConcept.id === c.id
                    ? 'bg-amber-500 border-amber-500 shadow-xl shadow-amber-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                }`}
              >
                <span className="text-2xl transition-transform group-hover:scale-110">{c.icon}</span>
                <h4 className={`text-sm font-black uppercase italic tracking-tighter leading-tight ${selectedConcept.id === c.id ? 'text-slate-950' : 'text-white'}`}>
                  {c.label}
                </h4>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-4">
              <span>{selectedConcept.icon}</span>
              Bridging {selectedConcept.label}
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Input your domain expertise or hobby</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input 
                      type="text"
                      value={hobby}
                      onChange={(e) => setHobby(e.target.value)}
                      placeholder="e.g., F1 Hydraulics, Espresso, Scuba Diving..."
                      className="w-full bg-slate-950 border-2 border-slate-800 p-5 rounded-2xl text-xl font-black text-white italic focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleTranslate}
                    disabled={loading || !hobby}
                    className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl disabled:opacity-30"
                  >
                    {loading ? 'Synthesizing...' : 'Generate Analogy'}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_HOBBIES.map((h) => (
                  <button 
                    key={h}
                    onClick={() => setHobby(h)}
                    className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-1.5 rounded-full border border-slate-800 hover:border-amber-500/50 hover:text-amber-500 transition-all"
                  >
                    + {h}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {translation && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative group">
                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Domain Theory</div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium italic">
                      {translation.hobbyAnalogy}
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative group">
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Engineering Core</div>
                    <p className="text-slate-200 text-sm leading-relaxed font-medium">
                      {translation.physicsExplanation}
                    </p>
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] text-slate-950 relative overflow-hidden shadow-2xl">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">The Mathematical Link</h4>
                  <p className="text-xl font-black italic tracking-tight leading-tight mb-8">
                    "{translation.mathematicalLogic}"
                  </p>
                  <div className="bg-slate-950 text-white p-6 rounded-2xl border border-slate-800">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Real World Scenario</p>
                     <p className="text-xs font-medium leading-relaxed">{translation.realWorldScenario}</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptBridge;