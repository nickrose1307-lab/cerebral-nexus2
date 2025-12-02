import { LevelConfig, PuzzleType } from './types';

export const LEVEL_DEFINITIONS: LevelConfig[] = [
  {
    id: 1,
    title: "The Awakening",
    description: "Simple word riddles to warm up your neural pathways.",
    type: PuzzleType.RIDDLE,
    requiredWins: 3,
    themeColor: "cyan"
  },
  {
    id: 2,
    title: "Logic Gate",
    description: "Basic deductive reasoning and logic puzzles.",
    type: PuzzleType.LOGIC,
    requiredWins: 3,
    themeColor: "blue"
  },
  {
    id: 3,
    title: "Emoji Crypt",
    description: "Decipher the meaning behind the abstract symbols.",
    type: PuzzleType.EMOJI,
    requiredWins: 3,
    themeColor: "purple"
  },
  {
    id: 4,
    title: "Number Void",
    description: "Mathematical patterns and sequence completions.",
    type: PuzzleType.MATH,
    requiredWins: 3,
    themeColor: "emerald"
  },
  {
    id: 5,
    title: "Lateral Shift",
    description: "Think outside the box. The obvious answer is wrong.",
    type: PuzzleType.LATERAL,
    requiredWins: 4,
    themeColor: "amber"
  },
  {
    id: 6,
    title: "Semantic Bridge",
    description: "Find the hidden connection between disparate words.",
    type: PuzzleType.WORD_ASSOCIATION,
    requiredWins: 4,
    themeColor: "orange"
  },
  {
    id: 7,
    title: "Deep Sequence",
    description: "Complex algorithmic pattern recognition.",
    type: PuzzleType.SEQUENCE,
    requiredWins: 4,
    themeColor: "red"
  },
  {
    id: 8,
    title: "The Oracle",
    description: "Twisted trivia that requires second-order thinking.",
    type: PuzzleType.TRIVIA_TWIST,
    requiredWins: 5,
    themeColor: "fuchsia"
  },
  {
    id: 9,
    title: "Master's Trial",
    description: "High-difficulty logic and paradoxes.",
    type: PuzzleType.LOGIC,
    requiredWins: 5,
    themeColor: "rose"
  },
  {
    id: 10,
    title: "Nexus Core",
    description: "The ultimate test of cognitive flexibility.",
    type: PuzzleType.LATERAL,
    requiredWins: 1, // Final boss feel
    themeColor: "violet"
  }
];

export const INITIAL_PROGRESS = {
  unlockedLevel: 1,
  levelWins: {},
  totalScore: 0,
  seenPuzzles: [],
  medals: {}
};