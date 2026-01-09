
import React, { useState } from 'react';
import { analyzeBackground } from '../services/geminiService';
import { BackgroundAnalysis } from '../types';

const OnboardingAssessment: React.FC = () => {
  const [employment, setEmployment] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BackgroundAnalysis | null>(null);

  const handleAssessment = async () => {
    if (!employment || !strengths) return;
    setLoading(true);
    try {
      const analysis = await analyzeBackground(employment, strengths, weaknesses);
      setResult(analysis);
    } catch (error) {
      console.error(error);
      alert('The audit system failed to process your background. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      <header className="border-b border-slate-800 pb-8">
        <span className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          Talent Audit & Feasibility
        </span>
        <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Skill Bridge Assessment</h2>
        <p className="text-slate-400 font-medium max-w-2xl">
          Disclose your professional history to see how your current DNA maps to the high-stakes world of well control and drilling physics.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Past Employment History</label>
              <textarea
                value={employment}
                onChange={(e) => setEmployment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 h-32 resize-none"
                placeholder="What have you done for work in the past? (e.g. Mechanic, Chef, Retail Manager, Military...)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Core Strengths</label>
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 h-24 resize-none"
                placeholder="What are you naturally good at? (e.g. Troubleshooting, heavy lifting, mathematics, calmness under pressure...)"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Perceived Weaknesses</label>
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-5 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-700 h-24 resize-none"
                placeholder="What areas do you feel less confident in? (e.g. Physics concepts, long shifts, remote locations...)"
              />
            </div>
          </div>
          
          <button
            onClick={handleAssessment}
            disabled={loading || !employment || !strengths}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all text-sm shadow-xl ${
              loading 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-white hover:bg-blue-500 text-slate-950 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Running Talent Audit...' : 'Analyze Transition Potential →'}
          </button>
        </div>

        <div className="relative">
          {result ? (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
              {/* Transferability Score Card */}
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center mb-4">
                  <span className="text-4xl font-black text-blue-400">{result.transferabilityScore}%</span>
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Transition Readiness</h4>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Based on your unique mechanical and psychological profile.
                </p>
              </div>

              {/* Strengths Mapping */}
              <div className="bg-slate-900 border-l-4 border-emerald-500 p-8 rounded-[2rem] shadow-lg">
                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4">Strategic Synergies</h3>
                <p className="text-slate-200 text-sm leading-relaxed font-medium">
                  {result.strengthsDeepDive}
                </p>
              </div>

              {/* Gap Analysis */}
              <div className="bg-slate-900 border-l-4 border-red-500 p-8 rounded-[2rem] shadow-lg">
                <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4">The Bridge Gap</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {result.gapAnalysis}
                </p>
              </div>

              {/* Recommended Focus */}
              <div className="bg-blue-500 p-10 rounded-[2.5rem] text-slate-950">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Immediate Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {result.recommendedFocus.map((f, i) => (
                    <span key={i} className="bg-slate-950 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      {f}
                    </span>
                  ))}
                </div>
                <div className="mt-8 pt-8 border-t border-slate-950/10">
                  <p className="text-sm font-bold leading-tight">
                    {result.transitionStrategy}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-center opacity-40">
              <div className="text-6xl mb-6">🔍</div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter italic mb-4">Awaiting Data Disclosure</h4>
              <p className="text-slate-500 max-w-xs text-sm font-medium">
                Submit your professional profile on the left to unlock a personalized transition roadmap and synergy analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingAssessment;
