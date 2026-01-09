
import React, { useState, useRef, useEffect } from 'react';
import { translateConcept } from '../services/geminiService';
import { ConceptTranslation } from '../types';

const WELL_ENGINEERING_CONCEPTS = [
  { id: 'hydrostatics', label: 'Hydrostatic Pressure', icon: '💧' },
  { id: 'hole_cleaning', label: 'Hole Cleaning', icon: '🧹' },
  { id: 'gas_migration', label: 'Gas Migration', icon: '🫧' },
  { id: 'well_control', label: 'Well Control & BOP', icon: '🛑' },
  { id: 'directional', label: 'Directional Drilling', icon: '🎯' },
  { id: 'mpd', label: 'Managed Pressure Drilling', icon: '🔄' },
  { id: 'hydraulics', label: 'Wellbore Hydraulics', icon: '🌊' },
  { id: 'casing', label: 'Casing & Tubing Design', icon: '🏗️' }
];

const SUGGESTED_HOBBIES = [
  "Scuba Diving", "F1 Car Hydraulics", "Aquarium Design", 
  "Residential Plumbing", "Mountain Biking", "Espresso Extraction", 
  "Pressure Canning", "Photography", "Gardening"
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

  // Constants for Pressure calculation
  const SG_TO_PPG = 8.33;
  const G_CONST = 0.052; // PSI per ft per ppg
  const TVD_ft = depth * 100; // Scaled depth for visualization
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
    setProbes(prev => [...prev.slice(-3), { x, y: hoverY, id: Date.now() }]);
  };

  const activePreset = FLUID_PRESETS.find(p => Math.abs(p.sg - density) < 0.05) || FLUID_PRESETS[1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      {/* Background Formula Watermark */}
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white z-0">
        <span className="text-[16rem] font-black italic uppercase tracking-tighter leading-none">P = ρgh</span>
      </div>

      {/* Visualizer Column */}
      <div className="flex flex-col gap-4 flex-shrink-0 z-10">
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverY(null)}
          onClick={handleAddProbe}
          className="relative w-80 h-[50rem] bg-slate-950 border-4 border-slate-800 rounded-[3rem] overflow-hidden shadow-inner cursor-crosshair group"
        >
          {/* Surface Air */}
          <div 
            className="absolute top-0 left-0 right-0 bg-slate-900/50 flex flex-col items-center justify-center border-b border-white/5 transition-all duration-700"
            style={{ height: `${100 - depth}%` }}
          >
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Surface Atmosphere</span>
          </div>

          {/* Fluid Body */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${activePreset.color} transition-all duration-700 ease-out`}
            style={{ height: `${depth}%` }}
          >
            {/* Height Rule / Weight Gradient Grid Overlay */}
            {showGrid && (
              <div className="absolute inset-0 flex flex-col pointer-events-none opacity-50">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="flex-1 border-b border-white/10 flex items-center justify-end pr-4 relative"
                  >
                    <div 
                      className="h-[1px] bg-blue-400/30 rounded-full transition-all duration-700"
                      style={{ width: `${(i + 1) * 5}%` }}
                    ></div>
                    {i % 5 === 4 && <span className="absolute left-4 text-[6px] font-black text-white/20 uppercase tracking-tighter">Stack Segment</span>}
                  </div>
                ))}
              </div>
            )}

            {/* Deployed Probes */}
            {probes.map(p => {
              const pressure = calculatePressureAtY(p.y);
              const fluidTopY = (containerRef.current?.getBoundingClientRect().height || 0) * (1 - depth/100);
              const relativeY = p.y - fluidTopY;

              return (
                <div key={p.id} className="absolute" style={{ left: p.x, top: relativeY }}>
                  {/* Omnidirectional Vectors */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                      <div 
                        key={angle}
                        className="absolute h-0.5 bg-amber-500/60 origin-left transition-all duration-500"
                        style={{ 
                          transform: `rotate(${angle}deg)`,
                          width: `${15 + pressure * 0.02}px`, 
                        }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-r border-t border-amber-500 rotate-45"></div>
                      </div>
                    ))}
                  </div>
                  <div className="w-3 h-3 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-xl border-2 border-amber-500 animate-pulse absolute"></div>
                  <div className="bg-slate-950 border border-amber-500/50 px-3 py-1.5 rounded-lg backdrop-blur-md -translate-y-12 -translate-x-1/2 shadow-2xl">
                     <span className="text-[12px] font-black text-white font-mono">{pressure} <span className="text-[8px] opacity-40">PSI</span></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hover Tracker */}
          {hoverY !== null && probes.length < 3 && (
            <div className="absolute w-full border-t border-amber-500/30 pointer-events-none z-30" style={{ top: hoverY }}>
               <div className="bg-slate-950/80 px-2 py-0.5 rounded ml-2 mt-2 inline-block border border-amber-500/20">
                 <span className="text-[9px] font-mono text-amber-500 font-bold">{calculatePressureAtY(hoverY)} PSI</span>
               </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setShowGrid(!showGrid)} className={`p-3 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${showGrid ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
            {showGrid ? 'Hide Weight Grid' : 'Show Weight Grid'}
          </button>
          <button onClick={() => setProbes([])} className="p-3 bg-slate-800 rounded-2xl text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 transition-all">
            Reset Probes
          </button>
        </div>
      </div>

      {/* Control Panel & Content */}
      <div className="flex-1 space-y-8 z-10">
        <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 gap-2">
           {['Simulation', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        {viewMode === 'Simulation' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">1. Fluid Density (ρ)</label>
                   <div className="grid grid-cols-2 gap-2">
                      {FLUID_PRESETS.map((p) => (
                        <button key={p.label} onClick={() => setDensity(p.sg)}
                          className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase border transition-all ${density === p.sg ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                          {p.label}
                        </button>
                      ))}
                   </div>
                   <input type="range" min="0.5" max="2.0" step="0.05" value={density} onChange={(e) => setDensity(parseFloat(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                   <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-500">Specific Gravity:</span>
                      <span className="text-blue-400 font-bold">{density.toFixed(2)} SG</span>
                   </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">2. Vertical Height (h)</label>
                   <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <span className="text-3xl font-black text-white italic font-mono">{TVD_ft}</span>
                      <span className="text-[10px] font-black text-slate-600 uppercase">Feet (TVD)</span>
                   </div>
                   <input type="range" min="10" max="100" value={depth} onChange={(e) => setDepth(parseInt(e.target.value))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                </div>
             </div>

             <div className="bg-slate-950 p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all"></div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                   <div className="space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Total Hydrostatic Head</span>
                      <h4 className="text-7xl font-black text-white italic tracking-tighter leading-none">{hydrostaticP} <span className="text-sm opacity-30 font-mono uppercase tracking-tighter">PSI</span></h4>
                   </div>
                   <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 max-w-xs text-center">
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest leading-relaxed">
                        The "Weight Rule": At depth, the fluid column pushes <span className="text-white">EQUALLY</span> in all directions.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {viewMode === 'Theory' && (
          <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
             <div className="bg-slate-950 p-20 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden shadow-inner group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
                <h5 className="text-[12px] font-black text-blue-500 uppercase tracking-[0.5em] mb-12">The Governing Law</h5>
                <h4 className="text-[10rem] font-black text-white italic tracking-tighter leading-none drop-shadow-2xl select-none">P = ρgh</h4>
                <div className="mt-12 flex justify-center gap-16 text-slate-500">
                   <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white italic">ρ (Rho)</span>
                      <span className="text-[8px] font-black uppercase tracking-widest mt-1">Density (ppg/sg)</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <span className="text-2xl font-black text-white italic">h (Height)</span>
                      <span className="text-[8px] font-black uppercase tracking-widest mt-1">Vertical Depth (TVD)</span>
                   </div>
                </div>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] relative shadow-xl">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] mb-8 italic">Key Concept: Isostasy</h4>
                <p className="text-slate-300 text-lg leading-relaxed font-medium mb-6 italic">
                  Unlike a solid object which only pushes down, a fluid under pressure pushes <span className="text-white font-bold underline decoration-amber-500 underline-offset-4">outwards and upwards</span> with the exact same magnitude as it pushes downwards. 
                </p>
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center gap-6">
                   <div className="text-3xl">🧭</div>
                   <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed">
                     This is why a balloon underwater shrinks from all sides, not just the top. In a wellbore, this radial pressure is what keeps the formation from collapsing into the hole.
                   </p>
                </div>
             </div>
          </div>
        )}

        {viewMode === 'Analogies' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-500">
             {[
               { 
                 title: 'Scuba Diving', 
                 icon: '🤿', 
                 color: 'text-blue-400', 
                 desc: 'At the surface, you feel 1 atmosphere. Dive to 10m (33ft), and the weight of the water above you adds exactly 1 more atmosphere. Your lungs must equalize this omnidirectional squeeze to function.',
                 math: 'P_abs = P_atm + P_fluid'
               },
               { 
                 title: 'F1 Hydraulics', 
                 icon: '🏎️', 
                 color: 'text-red-500', 
                 desc: 'Brake fluid acts as a column of pressure. The fluid doesn\'t just push the piston; it creates a "head" of potential energy throughout the line. Mud in a wellbore is a pre-loaded hydraulic circuit.',
                 math: 'Force = Pressure × Area'
               },
               { 
                 title: 'Aquarium Design', 
                 icon: '🐠', 
                 color: 'text-emerald-400', 
                 desc: 'Engineers design aquarium glass based purely on height. A tank 2ft wide and 10ft tall needs much thicker glass at the bottom than a tank 10ft wide and 2ft tall. Height defines the stress.',
                 math: 'Stress ∝ Water Height'
               }
             ].map((a) => (
               <div key={a.title} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group hover:border-amber-500 transition-all flex flex-col text-center items-center">
                  <div className="text-6xl mb-8 transform group-hover:scale-110 transition-transform">{a.icon}</div>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${a.color} mb-4`}>{a.title}</span>
                  <p className="text-[12px] text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-300 mb-8 flex-1">
                    {a.desc}
                  </p>
                  <div className="mt-auto bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                    <code className="text-[10px] font-mono text-amber-500 font-bold">{a.math}</code>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ... keep existing visualizers (HoleCleaningVisualizer, GasMigrationVisualizer, etc.) ...

const HoleCleaningVisualizer: React.FC = () => {
  const [flowRate, setFlowRate] = useState(450);
  const [viscosity, setViscosity] = useState(35);
  const [inclination, setInclination] = useState(0);
  const [particleSize, setParticleSize] = useState(5);
  const [viewMode, setViewMode] = useState<'Simulation' | 'Rheology' | 'BoycottEffect' | 'Analogies'>('Simulation');

  const annularArea = 35;
  const annularVelocity = (flowRate * 24.5) / annularArea;
  const slipVelocity = (particleSize * 15) / (viscosity / 5); 
  const netVelocity = annularVelocity - (slipVelocity * Math.cos((inclination * Math.PI) / 180));
  const transportRatio = Math.max(0, Math.min(1, netVelocity / annularVelocity));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white">
        <span className="text-[14rem] font-black italic uppercase tracking-tighter leading-none">V_net = V_a - V_s</span>
      </div>

      <div className="relative w-80 h-[48rem] bg-slate-950 border-4 border-slate-800 rounded-[3.5rem] overflow-hidden shadow-inner group flex-shrink-0">
        <div className="absolute inset-0 transition-transform duration-1000 origin-top" style={{ transform: `rotate(${inclination}deg)` }}>
          <div className="absolute inset-0 bg-blue-500/5 overflow-hidden">
             {Array.from({ length: 8 }).map((_, i) => (
               <div key={i} className="absolute w-full h-1 bg-blue-400/10 blur-sm animate-[pulse_2s_infinite]" style={{ top: `${i * 15}%`, animationDelay: `${i * 0.2}s` }} />
             ))}
          </div>

          <div className="absolute inset-0">
             {Array.from({ length: 25 }).map((_, i) => {
               const delay = Math.random() * 5;
               const speed = 10 / (netVelocity / 50 || 1);
               const isStuck = transportRatio < 0.2;
               return (
                 <div key={i} className={`absolute bg-amber-600 rounded-full shadow-[0_0_8px_rgba(217,119,6,0.5)] transition-all ${isStuck ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}`}
                   style={{
                     width: `${particleSize * 1.5 + 2}px`,
                     height: `${particleSize * 1.5 + 2}px`,
                     left: `${Math.random() * 80 + 10}%`,
                     bottom: `-10%`,
                     animation: isStuck ? 'none' : `moveUp ${speed}s linear infinite`,
                     animationDelay: `${delay}s`,
                   }}
                 />
               );
             })}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-slate-950 to-transparent z-20 text-center">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Transport Efficiency</span>
             <span className="text-4xl font-black text-white italic font-mono">{Math.round(transportRatio * 100)}%</span>
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 gap-2 shadow-inner overflow-x-auto">
           {['Simulation', 'Rheology', 'BoycottEffect', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 min-w-[120px] py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Flow Rate (GPM)</label>
               <input type="range" min="0" max="1000" value={flowRate} onChange={(e) => setFlowRate(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
               <div className="text-right mt-2 text-white font-mono font-bold">{flowRate}</div>
            </div>
            <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 italic">Viscosity (cP)</label>
               <input type="range" min="1" max="100" value={viscosity} onChange={(e) => setViscosity(Number(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer" />
               <div className="text-right mt-2 text-white font-mono font-bold">{viscosity}</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes moveUp {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-700px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const GasMigrationVisualizer: React.FC = () => {
  const [bubbleDepth, setBubbleDepth] = useState(100); 
  const [initialVolume, setInitialVolume] = useState(1); 
  const [mudWeight, setMudWeight] = useState(10); 
  const [isMigrating, setIsMigrating] = useState(false);
  const [viewMode, setViewMode] = useState<'Simulation' | 'Theory' | 'Analogies'>('Simulation');

  const SURFACE_P = 14.7;
  const TOTAL_DEPTH = 10000; 
  
  const currentTVD = (bubbleDepth / 100) * TOTAL_DEPTH;
  const initialP = (0.052 * mudWeight * TOTAL_DEPTH) + SURFACE_P;
  const currentP = (0.052 * mudWeight * currentTVD) + SURFACE_P;
  
  const currentVolume = (initialP * initialVolume) / currentP;
  const expansionRatio = currentVolume / initialVolume;

  // Fix: Missing useEffect from React
  useEffect(() => {
    let interval: number;
    if (isMigrating && bubbleDepth > 0) {
      interval = window.setInterval(() => {
        setBubbleDepth(prev => Math.max(0, prev - 0.2));
      }, 50);
    } else {
      setIsMigrating(false);
    }
    return () => clearInterval(interval);
  }, [isMigrating, bubbleDepth]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white">
        <span className="text-[14rem] font-black italic uppercase tracking-tighter leading-none">P₁V₁ = P₂V₂</span>
      </div>

      <div className="flex flex-col gap-4 flex-shrink-0">
        <div className="relative w-80 h-[48rem] bg-slate-950 border-4 border-slate-800 rounded-[3.5rem] overflow-hidden shadow-inner flex flex-col">
          <div className="absolute inset-0 bg-slate-900/40"></div>
          
          <div 
            className="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-linear z-30"
            style={{ 
              top: `${bubbleDepth}%`,
              width: `${Math.min(120, 20 * Math.sqrt(currentVolume))}px`,
              height: `${Math.min(120, 20 * Math.sqrt(currentVolume))}px`,
              transform: `translate(-50%, -50%)`,
            }}
          >
            <div className="w-full h-full bg-white/20 border-2 border-white/50 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-transparent animate-pulse"></div>
               <span className="text-[10px] font-black text-white italic drop-shadow-md">G-GAS</span>
            </div>
            <div className="absolute inset-0 border border-white/20 rounded-full animate-ping"></div>
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-12 border-r border-white/5 flex flex-col justify-between p-2 z-20">
             {[0, 2500, 5000, 7500, 10000].map(d => (
               <span key={d} className="text-[7px] font-black text-slate-600 font-mono">{d}ft</span>
             ))}
          </div>

          <div className="absolute inset-y-0 left-12 right-12 border-x border-slate-700 bg-slate-800/10"></div>
          
          <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 border-b border-slate-800 flex items-center justify-center z-40 backdrop-blur-sm">
             <div className="flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Surface Pit Gain</span>
                <span className={`text-xl font-black italic ${expansionRatio > 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  +{Math.round(currentVolume * 10) / 10} <span className="text-[10px]">bbl</span>
                </span>
             </div>
          </div>
        </div>
        
        <button 
          onClick={() => { setBubbleDepth(100); setIsMigrating(true); }}
          className="w-full bg-amber-500 text-slate-950 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-xl active:scale-95"
        >
          Inject Gas & Start Migration
        </button>
      </div>

      <div className="flex-1 space-y-8 flex flex-col overflow-hidden">
        <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 gap-2 shadow-inner">
           {['Simulation', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {viewMode === 'Simulation' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6 shadow-inner">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">1. Initial Conditions</label>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white uppercase">Influx Size</span>
                          <span className="text-xs font-mono font-bold text-blue-400">{initialVolume} bbl</span>
                       </div>
                       <input type="range" min="0.1" max="5" step="0.1" value={initialVolume} onChange={(e) => { setInitialVolume(Number(e.target.value)); setBubbleDepth(100); }} className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                       
                       <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] font-black text-white uppercase">Mud Density (MW)</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{mudWeight} ppg</span>
                       </div>
                       <input type="range" min="8" max="18" step="0.1" value={mudWeight} onChange={(e) => setMudWeight(Number(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col justify-center text-center shadow-inner relative overflow-hidden group">
                     <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">Expansion Multiplier</span>
                     <div className="text-6xl font-black text-white italic tracking-tighter transition-all group-hover:scale-110">
                        {expansionRatio.toFixed(1)}<span className="text-sm opacity-30 ml-2">x</span>
                     </div>
                     <p className="text-[8px] font-bold text-amber-500 uppercase tracking-widest mt-4 italic">Critical Risk Zone: &gt;10x Expansion</p>
                  </div>
               </div>

               <div className="bg-slate-950 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                     <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4">Physics Monitor: Boyle's Law</span>
                        <div className="space-y-4">
                           <div className="flex justify-between text-xs font-mono border-b border-slate-800 pb-2">
                              <span className="text-slate-500 uppercase">Current Pressure:</span>
                              <span className="text-white">{Math.round(currentP)} psi</span>
                           </div>
                           <div className="flex justify-between text-xs font-mono border-b border-slate-800 pb-2">
                              <span className="text-slate-500 uppercase">Hydrostatic Head:</span>
                              <span className="text-white">{Math.round(0.052 * mudWeight * currentTVD)} psi</span>
                           </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] block mb-2">Well Status</span>
                        <h4 className={`text-4xl font-black uppercase italic tracking-tighter ${bubbleDepth < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                           {bubbleDepth < 10 ? 'RAPID UNLOADING' : bubbleDepth < 50 ? 'EXPANDING' : 'MIGRATING'}
                        </h4>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Theory' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
               <div className="bg-slate-950 p-20 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden shadow-inner group">
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
                 <h5 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] mb-12">The Governing Equation</h5>
                 <h4 className="text-[8rem] font-black text-white italic tracking-tighter leading-none select-none drop-shadow-2xl">P₁V₁ = P₂V₂</h4>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-12">Pressure × Volume = Constant (Boyle's Law)</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-950 p-12 rounded-[3.5rem] border border-slate-800 relative overflow-hidden shadow-xl group">
                    <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">Migration Speed</h4>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                      Gas is less dense than mud. In a static well, a gas kick will migrate upwards at approximately <span className="text-white font-bold">1,000 ft per hour</span>. As it rises, the surrounding pressure (ρgh) decreases, forcing the gas to occupy more volume.
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] relative overflow-hidden shadow-xl group">
                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.5em] mb-8">Uncontrolled Expansion</h4>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                      The closer to the surface, the faster the expansion. A 1 bbl kick at 10,000 ft becomes <span className="text-white font-bold">dozens of barrels</span> just below the surface, potentially displacing the entire mud column and leading to a blowout.
                    </p>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-500">
               {[
                 { 
                   title: 'The Soda Bottle', 
                   icon: '🥤', 
                   color: 'text-amber-400', 
                   desc: 'A sealed bottle of soda has high internal pressure, keeping CO2 dissolved. When you open it (reducing pressure), the gas instantly expands, creating fizz and potentially overflowing. Gas migration is like the wellbore "popping the cap" as gas reaches the surface.',
                   math: 'P_atm < P_internal'
                 },
                 { 
                   title: 'Weather Balloon', 
                   icon: '🎈', 
                   color: 'text-blue-500', 
                   desc: 'When a weather balloon is released, it is only partially filled. As it reaches higher altitudes where atmospheric pressure is lower, the gas inside expands until the balloon reaches its full diameter. Gas in the well does the same as it rises.',
                   math: 'Volume ∝ 1 / Pressure'
                 },
                 { 
                   title: 'Leaky Balloon', 
                   icon: '🌬️', 
                   color: 'text-emerald-400', 
                   desc: 'Imagine trying to hold a balloon underwater. It takes very little effort at the bottom. But as you move it up, it grows larger and harder to control, eventually bursting or shooting out of the water if released.',
                   math: 'Buoyancy = f(Volume)'
                 }
               ].map((a) => (
                 <div key={a.title} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group hover:border-amber-500 transition-all flex flex-col text-center items-center">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{a.icon}</div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${a.color} mb-4`}>{a.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-300 mb-6">
                      {a.desc}
                    </p>
                    <div className="mt-auto bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                      <code className="text-[10px] font-mono text-amber-500 font-bold">{a.math}</code>
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

const DirectionalDrillingVisualizer: React.FC = () => {
  const [buildRate, setBuildRate] = useState(3); 
  const [turnRate, setTurnRate] = useState(0); 
  const [targetInclination, setTargetInclination] = useState(45);
  const [viewMode, setViewMode] = useState<'Simulation' | 'Theory' | 'Analogies'>('Simulation');

  const segments = 20;
  const generatePath = () => {
    let points = [{ x: 50, y: 0, z: 0, inc: 0, azm: 0 }];
    for (let i = 1; i <= segments; i++) {
      const prev = points[i - 1];
      const inc = Math.min(targetInclination, prev.inc + (buildRate * 0.5));
      const azm = prev.azm + (turnRate * 0.5);
      
      const dz = Math.cos(inc * Math.PI / 180);
      const dy = Math.sin(inc * Math.PI / 180) * Math.cos(azm * Math.PI / 180);
      const dx = Math.sin(inc * Math.PI / 180) * Math.sin(azm * Math.PI / 180);

      points.push({
        x: prev.x + dx * 20,
        y: prev.y + dy * 20,
        z: prev.z + dz * 20,
        inc,
        azm
      });
    }
    return points;
  };

  const path = generatePath();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 mt-6 flex flex-col lg:flex-row items-stretch gap-12 animate-in zoom-in duration-700 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 p-12 opacity-[0.03] pointer-events-none select-none text-white">
        <span className="text-[14rem] font-black italic uppercase tracking-tighter leading-none">MWD/RSS</span>
      </div>

      <div className="flex flex-col gap-6 flex-shrink-0">
        <div className="relative w-80 h-[45rem] bg-slate-950 border-4 border-slate-800 rounded-[3.5rem] overflow-hidden shadow-inner flex flex-col">
          <div className="flex-1 border-b border-slate-800 relative p-4 overflow-hidden">
            <span className="absolute top-2 left-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Profile View (Z vs Y)</span>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 400">
               <path 
                 d={`M 50 0 ${path.map(p => `L ${50 + p.y} ${p.z}`).join(' ')}`}
                 fill="none" 
                 stroke="#0ea5e9" 
                 strokeWidth="10" 
                 strokeLinecap="round"
                 className="transition-all duration-500"
               />
               <circle cx="50" cy="0" r="4" fill="#0ea5e9" />
               <circle cx={50 + path[path.length - 1].y} cy={path[path.length - 1].z} r="6" fill="#f59e0b" className="animate-pulse" />
            </svg>
          </div>
          
          <div className="h-48 relative p-4 bg-slate-950/50 overflow-hidden">
            <span className="absolute top-2 left-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">Plan View (X vs Y)</span>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100">
               <path 
                 d={`M 50 50 ${path.map(p => `L ${50 + p.x - 50} ${50 + p.y}`).join(' ')}`}
                 fill="none" 
                 stroke="#f59e0b" 
                 strokeWidth="4" 
                 strokeDasharray="4 2"
                 strokeLinecap="round"
               />
               <circle cx="50" cy="50" r="3" fill="#f59e0b" />
            </svg>
          </div>
        </div>
        
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-inner">
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Final Depth</span>
              <span className="text-xl font-black text-white italic font-mono">4,200 <span className="text-[10px] opacity-40">ft MD</span></span>
           </div>
           <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Departure</span>
              <span className="text-xl font-black text-amber-500 italic font-mono">1,450 <span className="text-[10px] opacity-40">ft VS</span></span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
        <div className="flex bg-slate-950 p-2 rounded-2xl border border-slate-800 gap-2 shadow-inner">
           {['Simulation', 'Theory', 'Analogies'].map((mode) => (
             <button key={mode} onClick={() => setViewMode(mode as any)}
               className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
               {mode}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {viewMode === 'Simulation' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">1. Vertical Steering (Build)</label>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white uppercase">Build Rate</span>
                          <span className="text-xs font-mono font-bold text-blue-400">{buildRate}°/100ft</span>
                       </div>
                       <input type="range" min="0" max="10" step="0.5" value={buildRate} onChange={(e) => setBuildRate(Number(e.target.value))} className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                       
                       <div className="flex justify-between items-center pt-2">
                          <span className="text-[9px] font-black text-white uppercase">Target Inclination</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{targetInclination}°</span>
                       </div>
                       <input type="range" min="0" max="90" value={targetInclination} onChange={(e) => setTargetInclination(Number(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                    </div>
                 </div>

                 <div className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 space-y-6">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block italic">2. Horizontal Steering (Turn)</label>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-white uppercase">Turn Rate (DLS)</span>
                          <span className="text-xs font-mono font-bold text-amber-500">{turnRate}°/100ft</span>
                       </div>
                       <input type="range" min="-5" max="5" step="0.5" value={turnRate} onChange={(e) => setTurnRate(Number(e.target.value))} className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer" />
                       <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                          <span>Left Turn</span>
                          <span>Neutral</span>
                          <span>Right Turn</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-950 p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]"></div>
                 <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 flex flex-col items-center">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">RSS Steering Head</span>
                       <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden">
                          <div className="w-1 h-8 bg-amber-500 rounded-full transition-transform duration-500 origin-bottom" style={{ transform: `rotate(${-turnRate * 15}deg)` }}></div>
                       </div>
                    </div>
                    <div className="flex-1 space-y-2">
                       <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Integrated Navigation Suite</h4>
                       <p className="text-xl font-black text-white italic tracking-tighter leading-tight">
                         The <span className="text-amber-500">RSS (Rotary Steerable System)</span> provides continuous steering control, while the <span className="text-blue-500">MWD (Measurement While Drilling)</span> tool sends live trajectory data via mud-pulse telemetry back to surface.
                       </p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {viewMode === 'Theory' && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
               <div className="bg-slate-950 p-20 rounded-[4rem] border border-slate-800 text-center relative overflow-hidden group shadow-inner">
                 <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent"></div>
                 <h5 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] mb-12">Geometry of Deviation</h5>
                 <div className="flex justify-center items-center gap-12">
                    <div className="flex flex-col items-center">
                       <h4 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-4">Inc</h4>
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Inclination (Vertical Tilt)</span>
                    </div>
                    <span className="text-4xl font-black text-slate-800">+</span>
                    <div className="flex flex-col items-center">
                       <h4 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-4">Azm</h4>
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Azimuth (Compass Direction)</span>
                    </div>
                 </div>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-12">DLS = f(ΔInc, ΔAzm) — Dogleg Severity / Curvature</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-500 p-12 rounded-[3.5rem] text-slate-950 relative overflow-hidden shadow-xl">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">The MWD Component</h4>
                    <p className="text-2xl font-black italic tracking-tight leading-tight">
                      "Measurement While Drilling acts as the wellbore's <span className="underline">Sensory Nervous System</span>. It uses magnetometers and accelerometers to determine exactly where the bit is in 3D space, relative to the target reservoir."
                    </p>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3.5rem] relative overflow-hidden shadow-xl">
                    <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.5em] mb-8">Rotary Steerable (RSS)</h4>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                      Unlike traditional "sliding" with a mud motor (which is slow and increases risk of sticking), RSS allows the entire drill string to <span className="text-white font-bold italic">rotate constantly</span> while internal pads or an internal mandrel orient the bit towards the target.
                    </p>
                  </div>
               </div>
            </div>
          )}

          {viewMode === 'Analogies' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-500">
               {[
                 { 
                   title: 'GPS Navigation', 
                   icon: '🛰️', 
                   color: 'text-blue-400', 
                   desc: 'MWD is the GPS on your dashboard. It doesn\'t steer the car, but it tells you exactly where you are and how many miles you are away from your destination. Without it, you are "driving blind" in a 30,000ft hole.',
                   math: 'Telemetry: Data ➔ Pulse ➔ Surf'
                 },
                 { 
                   title: 'Adaptive Cruise Control', 
                   icon: '🏎️', 
                   color: 'text-red-500', 
                   desc: 'Rotary Steerable is like modern Lane-Keep Assist or Autonomous Steering. It maintains the vehicle\'s rotation (drilling) while automatically making micro-adjustments to stay on the designated path.',
                   math: 'Active Path Correction'
                 },
                 { 
                   title: 'Flight Path Profile', 
                   icon: '✈️', 
                   color: 'text-emerald-400', 
                   desc: 'Inclination is like the "Pitch" of an airplane during takeoff (Building angle), and Azimuth is the "Heading". Directional drillers manage these two vectors to glide the well into a thin reservoir target.',
                   math: 'Vectoring ➔ 3D Targeting'
                 }
               ].map((a) => (
                 <div key={a.title} className="bg-slate-950 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner group hover:border-amber-500 transition-all flex flex-col text-center items-center">
                    <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform">{a.icon}</div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${a.color} mb-4`}>{a.title}</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic font-medium group-hover:text-slate-300 mb-6">
                      {a.desc}
                    </p>
                    <div className="mt-auto bg-slate-900 px-4 py-2 rounded-xl border border-white/5">
                      <code className="text-[10px] font-mono text-amber-500 font-bold">{a.math}</code>
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
      {selectedConcept.id === 'gas_migration' && <GasMigrationVisualizer />}

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
