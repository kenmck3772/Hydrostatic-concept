
import React, { useState } from 'react';
import { getCareerPath } from '../services/geminiService';
import { CareerPath } from '../types';

const CareerMapper: React.FC = () => {
  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerPath | null>(null);

  const handleMap = async () => {
    if (!interests || !skills) return;
    setLoading(true);
    try {
      const path = await getCareerPath(interests, skills);
      setResult(path);
    } catch (error) {
      console.error(error);
      alert('Failed to generate path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Interactive Career Mapper</h2>
        <p className="text-slate-400 mb-6">Let AI analyze your unique background to find your perfect entry point into the energy sector.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">What are your primary interests?</label>
            <textarea
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all h-24"
              placeholder="e.g., Working with my hands, data analysis, leading teams, technology..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">What are your current skills or background?</label>
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all h-24"
              placeholder="e.g., Construction experience, Python coding, military background, mechanic..."
            />
          </div>
          <button
            onClick={handleMap}
            disabled={loading || !interests || !skills}
            className={`w-full py-4 rounded-xl font-bold transition-all ${
              loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
            }`}
          >
            {loading ? 'Mapping Path...' : 'Generate My Career Map'}
          </button>
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-slate-800 border-l-4 border-amber-500 rounded-xl p-6 shadow-lg">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Stage 1: Entry</span>
            <h3 className="text-xl font-bold mt-1 text-white">{result.startRole}</h3>
          </div>
          <div className="bg-slate-800 border-l-4 border-blue-500 rounded-xl p-6 shadow-lg">
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">Stage 2: Growth</span>
            <h3 className="text-xl font-bold mt-1 text-white">{result.midPath}</h3>
          </div>
          <div className="bg-slate-800 border-l-4 border-emerald-500 rounded-xl p-6 shadow-lg">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Stage 3: Mastery</span>
            <h3 className="text-xl font-bold mt-1 text-white">{result.endGoal}</h3>
          </div>

          <div className="md:col-span-3 bg-slate-800 border border-slate-700 rounded-xl p-8">
            <h4 className="font-bold text-lg mb-4 flex items-center">
              <span className="mr-2">💡</span> Strategic Insight
            </h4>
            <p className="text-slate-300 leading-relaxed mb-6 italic">"{result.justification}"</p>
            
            <h4 className="font-bold text-slate-100 mb-3">Key Skills to Develop:</h4>
            <div className="flex flex-wrap gap-2">
              {result.skills.map((skill, idx) => (
                <span key={idx} className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm border border-slate-600">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerMapper;
