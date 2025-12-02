export enum PuzzleType {
  RIDDLE = 'RIDDLE',
  LOGIC = 'LOGIC',
  MATH = 'MATH',
  LATERAL = 'LATERAL',
  EMOJI = 'EMOJI',
  WORD_ASSOCIATION = 'WORD_ASSOCIATION',
  SEQUENCE = 'SEQUENCE',
  TRIVIA_TWIST = 'TRIVIA_TWIST'
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  type: PuzzleType;
  requiredWins: number;
  themeColor: string; // Tailwind class mostly
}

export interface PuzzleData {
  question: string;
  answer: string; // The canonical answer (hidden from user)
  hint: string;
  difficulty: number;
}

export interface ValidationResult {
  isCorrect: boolean;
  explanation: string;
  scoreDelta: number;
}

export type Medal = 'GOLD' | 'SILVER' | 'BRONZE' | null;

export interface UserProgress {
  unlockedLevel: number; // Highest level unlocked (1-based)
  levelWins: Record<number, number>; // Map of Level ID -> Number of wins
  totalScore: number;
  seenPuzzles: string[]; // List of previously seen puzzle questions to avoid repetition
  medals: Record<number, Medal>; // Map of Level ID -> Medal earned
}

export type GameState = 'MENU' | 'PLAYING' | 'LEVEL_COMPLETE' | 'VICTORY' | 'LOADING';