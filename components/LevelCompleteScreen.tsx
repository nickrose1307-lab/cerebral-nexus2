import React from 'react';
import { LevelConfig, Medal } from '../types';
import { IconMedal, IconStar, IconBrain } from './Icons';

interface LevelCompleteScreenProps {
  level: LevelConfig;
  score: number;
  medal: Medal;
  onNextLevel: () => void;
  isLastLevel: boolean;
}

const LevelCompleteScreen: React.FC<LevelCompleteScreenProps> = ({ 
  level, 
  score, 
  medal, 
  onNextLevel,
  isLastLevel 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712]">
      <div className="max-w-lg w-full bg-slate-900/50 border border-slate-700 backdrop-blur-xl rounded-3xl p-8 md:p-12 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <h2 className="text-indigo-400 text-sm tracking-[0.2em] font-bold uppercase mb-2">
            Mission Accomplished
          </h2>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            {level.title} Clear
          </h1>

          <div className="flex flex-col items-center justify-center mb-10 space-y-4">
            <div className={`
              p-6 rounded-full bg-slate-800 border-2 shadow-xl
              ${medal === 'GOLD' ? 'border-yellow-400 shadow-yellow-900/50' : 
                medal === 'SILVER' ? 'border-slate-300 shadow-slate-900/50' : 
                'border-amber-700 shadow-amber-900/50'}
            `}>
              <IconMedal type={medal} className="w-20 h-20" />
            </div>
            
            <div className="space-y-1">
              <p className="text-slate-400 text-sm uppercase tracking-wide">Level Score</p>
              <p className="text-4xl font-mono font-bold text-white">{score}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
               <div className="text-slate-500 text-xs uppercase mb-1">Medal Earned</div>
               <div className={`font-bold ${
                 medal === 'GOLD' ? 'text-yellow-400' :
                 medal === 'SILVER' ? 'text-slate-300' : 'text-amber-600'
               }`}>{medal}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
               <div className="text-slate-500 text-xs uppercase mb-1">Total XP</div>
               <div className="font-bold text-emerald-400">+ {Math.floor(score * 1.5)}</div>
            </div>
          </div>

          <button
            onClick={onNextLevel}
            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 group"
          >
            {isLastLevel ? (
                <>
                  <IconBrain className="w-5 h-5" />
                  Return to Menu
                </>
            ) : (
                <>
                  Next Level
                  <IconStar className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelCompleteScreen;