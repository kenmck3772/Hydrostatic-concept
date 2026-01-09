import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CareerMapper from './components/CareerMapper';
import ConceptBridge from './components/ConceptBridge';
import OnboardingAssessment from './components/OnboardingAssessment';
import KnowledgeCheck from './components/KnowledgeCheck';
import WellControlSimulator from './components/WellControlSimulator';
import ExamPrep from './components/ExamPrep';
import { COURSE_MODULES } from './constants';
import { generateKnowledgeCheck } from './services/geminiService';
import { AppState, Module, Lesson, QuizQuestion } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppState>('DASHBOARD');
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  
  // Progress tracking
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  const totalLessons = COURSE_MODULES.reduce((acc, mod) => acc + mod.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.size / totalLessons) * 100);

  const startKnowledgeCheck = async () => {
    if (!activeLesson) return;
    setIsQuizLoading(true);
    try {
      const questions = await generateKnowledgeCheck(activeLesson.title, activeLesson.content);
      setQuizQuestions(questions);
    } catch (error) {
      console.error(error);
      alert('Failed to generate knowledge check.');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizComplete = (score: number) => {
    if (activeLesson) {
      setQuizScores(prev => ({ ...prev, [activeLesson.id]: score }));
      setCompletedLessons(prev => new Set(prev).add(activeLesson.id));
    }
    setQuizQuestions(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD':
        return (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-800/50 pb-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">Well-Tegra Personal Lab v1.3</span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                </div>
                <h1 className="text-7xl font-black text-white tracking-tighter leading-none italic uppercase">
                  Control <br /><span className="text-slate-600 not-italic">Center</span>
                </h1>
                <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                  A personal laboratory for bridging domain expertise with industry standards. Focused on <span className="text-white font-bold italic">polishing technical knowledge</span> and enhancing individual skill sets.
                </p>
                <div className="pt-2">
                   <p className="text-[10px] text-slate-500 font-bold uppercase italic border-l-2 border-red-500/30 pl-4 max-w-lg leading-relaxed">
                      Disclaimer: This project is by no means affiliated with any accredited training centers. It is a concept built solely to enhance my own skill set and polish my domain knowledge.
                   </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setActiveTab('SIMULATOR')} className="bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl active:scale-95">Open Sim Lab</button>
              </div>
            </header>

            {/* Course Progress Overview */}
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Internal Competency Track</h3>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Self-Assessment Progress: {completedLessons.size} / {totalLessons} Units</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-48 h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span className="text-4xl font-black text-amber-500 font-mono">{progressPercent}%</span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Physics Synthesis', val: `${Math.round((completedLessons.size / totalLessons) * 100)}%`, color: 'amber', icon: '🧬' },
                { label: 'Well Control Study', val: 'L4 Prep', color: 'blue', icon: '🛑' },
                { label: 'Project Status', val: 'Personal Lab', color: 'emerald', icon: '⚖️' },
                { label: 'Learning Retention', val: '9.4/10', color: 'purple', icon: '🖥️' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800/60 p-6 rounded-3xl relative overflow-hidden group hover:border-slate-700 transition-all">
                  <div className="text-2xl mb-4">{stat.icon}</div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-white tracking-tighter italic">{stat.val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <section className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <span className="text-amber-500">IADC</span> WellSharp
                  </h3>
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/50 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Personal study focus on North American task-based frameworks. Emphasizing individual driller competency and mechanical shut-in response within the personal lab context. 
                    </p>
                  </div>
                </div>
              </section>

              <section className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                    <span className="text-blue-500">IWCF</span> Engineering
                  </h3>
                  <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800/50 space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                      Self-directed mastery of international standards focused on rigorous engineering design and wellbore integrity. Building the engineering mindset for global standards.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        );
      case 'LEARN':
        return (
          <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            <header className="mb-12 border-b border-slate-800 pb-10">
              <span className="inline-block bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.4em] mb-6">Internal Lab Module: Engineering Theory</span>
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic">Curriculum Archive</h2>
              <p className="text-slate-500 font-medium text-lg mt-4">Accelerate self-directed learning from awareness to engineering design mastery.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {COURSE_MODULES.map((mod) => {
                const modCompletedCount = mod.lessons.filter(l => completedLessons.has(l.id)).length;
                const isModComplete = modCompletedCount === mod.lessons.length;

                return (
                  <div 
                    key={mod.id} 
                    onClick={() => setSelectedModule(mod)} 
                    className={`bg-slate-900 border p-10 rounded-[3rem] group cursor-pointer transition-all active:scale-[0.98] shadow-2xl relative overflow-hidden ${
                      isModComplete ? 'border-emerald-500/50' : 'border-slate-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 group-hover:opacity-10 transition-opacity select-none">{mod.id.toUpperCase()}</div>
                    <div className="flex justify-between items-start mb-12 relative z-10">
                      <span className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${
                        isModComplete ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20' : 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                      }`}>{mod.id}</span>
                      {isModComplete && <span className="text-emerald-500 font-black text-[10px] uppercase">Review Complete ✓</span>}
                    </div>
                    <h3 className="text-3xl font-black text-white mb-6 tracking-tighter group-hover:text-amber-500 transition-colors uppercase italic relative z-10 leading-none">{mod.title}</h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10">{mod.objective}</p>
                  </div>
                );
              })}
            </div>

            {selectedModule && (
              <div className="fixed inset-0 bg-slate-950/98 z-50 flex items-center justify-center p-8 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl max-h-[85vh] overflow-hidden rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col">
                  <div className="p-10 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">{selectedModule.id}: Module Overview</span>
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">{selectedModule.title}</h3>
                    </div>
                    <button 
                      onClick={() => { setSelectedModule(null); setActiveLesson(null); setQuizQuestions(null); }} 
                      className="w-14 h-14 flex items-center justify-center bg-slate-800 text-white rounded-[1.2rem] hover:bg-red-500 transition-all text-xl font-bold shadow-xl active:scale-90"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                    <div className="w-80 border-r border-slate-800 overflow-y-auto p-6 space-y-3 bg-slate-950/20">
                       <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest px-4 mb-4">Select Study Packet</p>
                       {selectedModule.lessons.map((lesson) => {
                         const isDone = completedLessons.has(lesson.id);
                         return (
                           <button 
                             key={lesson.id}
                             onClick={() => { setActiveLesson(lesson); setQuizQuestions(null); }}
                             className={`w-full p-6 rounded-2xl text-left transition-all border group relative ${
                               activeLesson?.id === lesson.id 
                                 ? 'bg-amber-500 border-amber-500 shadow-lg shadow-amber-500/20' 
                                 : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                             }`}
                           >
                             <div className="flex justify-between items-center mb-2">
                               <span className={`text-[8px] font-black uppercase tracking-widest ${activeLesson?.id === lesson.id ? 'text-slate-950/60' : 'text-slate-500'}`}>⏱️ {lesson.duration}</span>
                               {isDone && <span className={`text-[10px] ${activeLesson?.id === lesson.id ? 'text-slate-950' : 'text-emerald-500'}`}>✓</span>}
                             </div>
                             <h4 className={`text-sm font-black uppercase italic tracking-tighter leading-tight ${activeLesson?.id === lesson.id ? 'text-slate-950' : 'text-white'}`}>
                               {lesson.title}
                             </h4>
                           </button>
                         );
                       })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-12 bg-slate-900/40">
                      {quizQuestions ? (
                        <KnowledgeCheck questions={quizQuestions} onComplete={handleQuizComplete} />
                      ) : activeLesson ? (
                        <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-500">
                           <div className="flex items-center space-x-3 mb-8">
                             <div className="w-10 h-1 bg-amber-500 rounded-full"></div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Detailed Analysis</span>
                           </div>
                           <h4 className="text-5xl font-black text-white mb-10 tracking-tighter uppercase italic leading-none">{activeLesson.title}</h4>
                           <div className="prose prose-invert max-w-none">
                              <p className="text-xl text-slate-300 leading-relaxed font-medium mb-12 border-l-4 border-slate-700 pl-8">
                                {activeLesson.content}
                              </p>
                              
                              <div className="flex flex-col gap-4">
                                <button 
                                  onClick={startKnowledgeCheck}
                                  disabled={isQuizLoading}
                                  className="w-full py-6 rounded-3xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600"
                                >
                                  {isQuizLoading ? 'Initializing Neural Link...' : 'Start Knowledge Check →'}
                                </button>
                                
                                <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl flex items-center justify-between group shadow-inner">
                                  <div className="space-y-2">
                                    <h5 className="text-blue-400 font-black text-xs uppercase tracking-widest">Physics Lab Sync</h5>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Bridge this concept to your personal analogies</p>
                                  </div>
                                  <button 
                                    onClick={() => { setActiveTab('BRIDGE'); setSelectedModule(null); }}
                                    className="bg-slate-800 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl"
                                  >
                                    Open Lab →
                                  </button>
                                </div>
                              </div>
                           </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                           <div className="text-6xl mb-6">📚</div>
                           <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">Select a Lesson Packet</h4>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'SIMULATOR':
        return <WellControlSimulator />;
      case 'MAPPER':
        return <CareerMapper />;
      case 'BRIDGE':
        return <ConceptBridge />;
      case 'ASSESSMENT':
        return <OnboardingAssessment />;
      case 'EXAM_PREP':
        return <ExamPrep />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <Sidebar currentTab={activeTab} setTab={setActiveTab} />
      <main className="flex-1 ml-64 p-16 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/20 via-transparent to-transparent">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;