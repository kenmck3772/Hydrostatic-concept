
import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface KnowledgeCheckProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
}

const KnowledgeCheck: React.FC<KnowledgeCheckProps> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionClick = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleVerify = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === questions[currentIdx].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx === questions.length - 1) {
      onComplete(score + (selectedOption === questions[currentIdx].correctIndex ? 1 : 0));
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Knowledge Check: Question {currentIdx + 1} / {questions.length}</span>
        <div className="flex space-x-1">
          {questions.map((_, i) => (
            <div key={i} className={`w-8 h-1 rounded-full ${i <= currentIdx ? 'bg-amber-500' : 'bg-slate-800'}`}></div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2rem] shadow-inner">
        <h4 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase italic leading-tight">{currentQ.question}</h4>
        
        <div className="grid grid-cols-1 gap-3">
          {currentQ.options.map((option, i) => {
            const isCorrect = i === currentQ.correctIndex;
            const isSelected = i === selectedOption;
            
            let btnClass = "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600";
            if (isAnswered) {
              if (isCorrect) btnClass = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
              else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-400";
              else btnClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-50";
            } else if (isSelected) {
              btnClass = "bg-amber-500/10 border-amber-500 text-amber-500";
            }

            return (
              <button
                key={i}
                onClick={() => handleOptionClick(i)}
                className={`w-full p-5 rounded-2xl text-left transition-all border font-bold text-sm ${btnClass}`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-[10px] font-black opacity-40">{String.fromCharCode(65 + i)}</span>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-in zoom-in duration-300">
          <div className="flex items-start space-x-4">
            <span className="text-2xl">{selectedOption === currentQ.correctIndex ? '✅' : '❌'}</span>
            <div>
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Technical Insight</p>
              <p className="text-sm text-slate-300 font-medium leading-relaxed">{currentQ.explanation}</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={isAnswered ? handleNext : handleVerify}
        disabled={selectedOption === null}
        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-sm ${
          selectedOption === null ? 'bg-slate-800 text-slate-600' : 'bg-amber-500 text-slate-950 shadow-xl'
        }`}
      >
        {isAnswered ? (currentIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Challenge →') : 'Verify Answer'}
      </button>
    </div>
  );
};

export default KnowledgeCheck;
