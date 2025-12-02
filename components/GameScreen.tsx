import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LevelConfig, PuzzleData } from '../types';
import { generatePuzzle, validateAnswer } from '../services/geminiService';
import { IconArrowLeft, IconLightbulb, IconBrain, IconRefresh } from './Icons';

interface GameScreenProps {
  level: LevelConfig;
  onBack: () => void;
  onWin: (score: number) => void;
  seenPuzzles: string[];
  onPuzzleSeen: (question: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ level, onBack, onWin, seenPuzzles, onPuzzleSeen }) => {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [validating, setValidating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string; earnedScore?: number } | null>(null);
  
  // Timer state
  const startTimeRef = useRef<number>(0);

  const loadNewPuzzle = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    setShowHint(false);
    try {
      const data = await generatePuzzle(level.type, level.id, seenPuzzles);
      setPuzzle(data);
      onPuzzleSeen(data.question);
      startTimeRef.current = Date.now(); // Start timer
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [level, seenPuzzles, onPuzzleSeen]);

  useEffect(() => {
    loadNewPuzzle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !puzzle) return;

    setValidating(true);
    try {
      const result = await validateAnswer(puzzle, userAnswer);
      
      let earnedScore = 0;
      if (result.isCorrect) {
        // Calculate Time Bonus
        const timeTakenSec = (Date.now() - startTimeRef.current) / 1000;
        // Base score from AI difficulty (usually around 100-300) + Time Bonus
        // Max Time Bonus = 500. Decreases by 5 points per second. Min 0.
        const timeBonus = Math.max(0, 500 - Math.floor(timeTakenSec * 5));
        const baseScore = result.scoreDelta || 100;
        earnedScore = baseScore + timeBonus;
      }

      setFeedback({
        isCorrect: result.isCorrect,
        message: result.explanation,
        earnedScore
      });

      if (result.isCorrect) {
        setTimeout(() => {
            onWin(earnedScore);
        }, 2000); 
      } else {
        setShowHint(true);
      }

    } catch (err) {
      console.error(err);
      setFeedback({ isCorrect: false, message: "Validation service error. Please try again." });
    } finally {
      setValidating(false);
    }
  };

  const handleNextPuzzle = () => {
    loadNewPuzzle();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-pulse">
        <IconBrain className="w-20 h-20 text-indigo-500 animate-bounce" />
        <h2 className="text-2xl font-light text-indigo-300">Consulting the Nexus...</h2>
        <p className="text-slate-500">Generating a unique {level.type.toLowerCase().replace('_', ' ')} puzzle.</p>
      </div>
    );
  }

  if (!puzzle) return <div className="text-center p-10 text-red-400">Error loading puzzle. <button onClick={loadNewPuzzle} className="underline">Retry</button></div>;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
            <IconArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Levels</span>
        </button>
        
        <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 tracking-wider hidden md:block">
                {level.title.toUpperCase()}
            </span>
            <button
                onClick={loadNewPuzzle}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700 hover:border-slate-600 text-sm group"
                title="Skip this puzzle and load a new one"
            >
                <IconRefresh className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Reset Puzzle</span>
                <span className="sm:hidden">Reset</span>
            </button>
        </div>
      </div>

      {/* Puzzle Card */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-20"></div>

            <div className="relative z-10 space-y-8">
                <div>
                    <h2 className="text-sm font-semibold text-indigo-400 tracking-widest uppercase mb-2">Question</h2>
                    <p className="text-2xl md:text-4xl font-medium leading-tight text-white">
                        {puzzle.question}
                    </p>
                </div>

                {showHint && (
                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg animate-in fade-in slide-in-from-top-2">
                        <p className="text-yellow-200 text-sm flex gap-2">
                            <IconLightbulb className="w-4 h-4 mt-0.5 shrink-0" />
                            {puzzle.hint}
                        </p>
                    </div>
                )}
            </div>
        </div>

        {/* Input Area */}
        <div className="mt-8 relative z-20">
            {feedback?.isCorrect ? (
                <div className="text-center space-y-6 animate-in zoom-in duration-300">
                    <div className="inline-block p-4 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Correct!</h3>
                    <p className="text-emerald-200/80 max-w-lg mx-auto">{feedback.message}</p>
                    
                    {feedback.earnedScore && (
                        <div className="text-indigo-300 font-mono text-xl">
                            +{feedback.earnedScore} PTS
                        </div>
                    )}
                    
                    <button 
                        onClick={handleNextPuzzle}
                        className="mt-4 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-emerald-900/50"
                    >
                        Next Puzzle
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer..."
                            disabled={validating}
                            className="w-full bg-slate-800/50 border border-slate-600 text-white text-lg px-6 py-4 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder:text-slate-600 transition-all"
                        />
                        <button
                           type="button"
                           onClick={() => setShowHint(true)}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-yellow-400 transition-colors"
                           title="Get a hint"
                        >
                            <IconLightbulb className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {feedback && !feedback.isCorrect && (
                         <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm text-center">
                            {feedback.message}
                         </div>
                    )}

                    <button
                        type="submit"
                        disabled={validating || !userAnswer.trim()}
                        className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all
                            ${validating 
                                ? 'bg-slate-700 text-slate-400 cursor-wait' 
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg hover:shadow-indigo-500/25 transform active:scale-[0.98]'
                            }
                        `}
                    >
                        {validating ? 'Analyzing...' : 'Submit Answer'}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;