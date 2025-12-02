import React from 'react';
import { LEVEL_DEFINITIONS } from '../constants';
import { UserProgress } from '../types';
import { IconLock, IconBrain, IconMedal } from './Icons';

interface MainMenuProps {
  progress: UserProgress;
  onSelectLevel: (levelId: number) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ progress, onSelectLevel }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-12 text-center space-y-4">
        <div className="inline-block p-4 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4 animate-pulse">
            <IconBrain className="w-12 h-12 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          CEREBRAL NEXUS
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Unlock the potential of your mind through progressive AI-generated challenges.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-sm font-medium text-slate-300">
          <span>Total Score:</span>
          <span className="text-emerald-400 font-bold">{progress.totalScore}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {LEVEL_DEFINITIONS.map((level) => {
          const isUnlocked = level.id <= progress.unlockedLevel;
          const wins = progress.levelWins[level.id] || 0;
          const medal = progress.medals[level.id];
          
          // Color mapping for dynamic styles
          const colorMap: Record<string, string> = {
            cyan: "border-cyan-500/50 hover:border-cyan-400 shadow-cyan-900/20",
            blue: "border-blue-500/50 hover:border-blue-400 shadow-blue-900/20",
            purple: "border-purple-500/50 hover:border-purple-400 shadow-purple-900/20",
            emerald: "border-emerald-500/50 hover:border-emerald-400 shadow-emerald-900/20",
            amber: "border-amber-500/50 hover:border-amber-400 shadow-amber-900/20",
            orange: "border-orange-500/50 hover:border-orange-400 shadow-orange-900/20",
            red: "border-red-500/50 hover:border-red-400 shadow-red-900/20",
            fuchsia: "border-fuchsia-500/50 hover:border-fuchsia-400 shadow-fuchsia-900/20",
            rose: "border-rose-500/50 hover:border-rose-400 shadow-rose-900/20",
            violet: "border-violet-500/50 hover:border-violet-400 shadow-violet-900/20",
          };

          const borderColor = colorMap[level.themeColor] || "border-slate-700";

          return (
            <button
              key={level.id}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(level.id)}
              className={`
                relative group flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 text-left w-full
                ${isUnlocked 
                  ? `bg-slate-900/50 backdrop-blur-sm ${borderColor} shadow-lg hover:shadow-xl hover:-translate-y-1` 
                  : 'bg-slate-900/30 border-slate-800 opacity-70 cursor-not-allowed'}
              `}
            >
              <div className="flex justify-between w-full mb-4">
                <span className={`text-sm font-bold tracking-wider ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                   LEVEL {level.id.toString().padStart(2, '0')}
                </span>
                {isUnlocked ? (
                   medal ? <IconMedal type={medal} className="w-6 h-6" /> : null
                ) : (
                  <IconLock className="w-5 h-5 text-slate-500" />
                )}
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                {level.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {level.description}
              </p>

              <div className="mt-auto w-full">
                <div className="flex justify-between items-center text-xs uppercase tracking-widest text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{wins} / {level.requiredWins}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ${wins >= level.requiredWins ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min((wins / level.requiredWins) * 100, 100)}%` }}
                    />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MainMenu;