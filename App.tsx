import React, { useState, useEffect } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import LevelCompleteScreen from './components/LevelCompleteScreen';
import { UserProgress, GameState, Medal } from './types';
import { INITIAL_PROGRESS, LEVEL_DEFINITIONS } from './constants';

const STORAGE_KEY = 'cerebral_nexus_progress';

const App: React.FC = () => {
  const [view, setView] = useState<GameState>('MENU');
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  
  // Track stats for the current playing session of a level
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionMedal, setSessionMedal] = useState<Medal>(null);

  // Load progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backward compatibility
        if (!parsed.seenPuzzles) parsed.seenPuzzles = [];
        if (!parsed.medals) parsed.medals = {};
        setProgress(parsed);
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
  }, []);

  // Save progress on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const handleSelectLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setSessionScore(0); // Reset session score for the new attempt
    setView('PLAYING');
  };

  const handleBackToMenu = () => {
    setView('MENU');
    setCurrentLevelId(null);
  };

  const handlePuzzleSeen = (question: string) => {
    setProgress(prev => {
      if (prev.seenPuzzles.includes(question)) return prev;
      const newSeen = [...prev.seenPuzzles, question];
      if (newSeen.length > 30) newSeen.shift();
      return { ...prev, seenPuzzles: newSeen };
    });
  };

  const handleWin = (score: number) => {
    if (currentLevelId === null) return;

    // Update current session score
    const newSessionScore = sessionScore + score;
    setSessionScore(newSessionScore);

    // Calculate progression
    const currentWins = (progress.levelWins[currentLevelId] || 0) + 1;
    const levelConfig = LEVEL_DEFINITIONS.find(l => l.id === currentLevelId);
    
    // Check if level is mastered with this win
    const isLevelMastered = levelConfig && currentWins >= levelConfig.requiredWins;
    const nextLevelExists = LEVEL_DEFINITIONS.some(l => l.id === currentLevelId + 1);

    // Determine Medal if mastered
    let earnedMedal: Medal = null;
    if (isLevelMastered && levelConfig) {
      const avgScore = newSessionScore / levelConfig.requiredWins;
      if (avgScore >= 600) earnedMedal = 'GOLD';
      else if (avgScore >= 400) earnedMedal = 'SILVER';
      else earnedMedal = 'BRONZE';
      setSessionMedal(earnedMedal);
    }

    setProgress(prev => {
      const wins = (prev.levelWins[currentLevelId] || 0) + 1;
      let nextUnlocked = prev.unlockedLevel;
      const currentMedals = { ...prev.medals };

      if (isLevelMastered) {
        // Unlock next level if we just beat the highest unlocked
        if (currentLevelId === prev.unlockedLevel) {
          nextUnlocked = currentLevelId + 1;
        }
        // Save medal (only overwrite if better? simplified: overwrite for now or only if new)
        // We'll just save the latest run's medal for simplicity in this logic
        if (earnedMedal) {
            currentMedals[currentLevelId] = earnedMedal;
        }
      }

      return {
        ...prev,
        levelWins: { ...prev.levelWins, [currentLevelId]: wins },
        totalScore: prev.totalScore + score,
        unlockedLevel: nextUnlocked,
        medals: currentMedals
      };
    });

    if (isLevelMastered) {
      setView('LEVEL_COMPLETE');
    }
    // If not mastered, GameScreen stays mounted and will just load next puzzle via its internal logic if we didn't unmount it.
    // However, GameScreen calls onWin. GameScreen needs to know to load next puzzle.
    // In current architecture, GameScreen decides to show "Next Puzzle" button or not. 
    // Since we handle "Next Puzzle" inside GameScreen, but we *unmount* it when view changes to LEVEL_COMPLETE.
  };

  const handleNextLevel = () => {
    if (currentLevelId === null) return;
    
    const nextId = currentLevelId + 1;
    const nextExists = LEVEL_DEFINITIONS.some(l => l.id === nextId);

    if (nextExists) {
      setCurrentLevelId(nextId);
      setSessionScore(0);
      setView('PLAYING');
    } else {
      // Game Over / All Levels Done
      handleBackToMenu();
    }
  };

  const currentLevelConfig = LEVEL_DEFINITIONS.find(l => l.id === currentLevelId);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 selection:bg-indigo-500/30 font-sans">
        {/* Background Gradients */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10">
            {view === 'MENU' && (
                <MainMenu progress={progress} onSelectLevel={handleSelectLevel} />
            )}

            {view === 'PLAYING' && currentLevelConfig && (
                <GameScreen 
                    key={currentLevelConfig.id} // Re-mounts on level change
                    level={currentLevelConfig} 
                    onBack={handleBackToMenu}
                    onWin={handleWin}
                    seenPuzzles={progress.seenPuzzles}
                    onPuzzleSeen={handlePuzzleSeen}
                />
            )}

            {view === 'LEVEL_COMPLETE' && currentLevelConfig && (
                <LevelCompleteScreen 
                  level={currentLevelConfig}
                  score={sessionScore}
                  medal={sessionMedal}
                  onNextLevel={handleNextLevel}
                  isLastLevel={!LEVEL_DEFINITIONS.some(l => l.id === (currentLevelId || 0) + 1)}
                />
            )}
        </div>
    </div>
  );
};

export default App;