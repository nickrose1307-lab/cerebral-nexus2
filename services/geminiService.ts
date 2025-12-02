import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData, PuzzleType, ValidationResult } from "../types";

// Initialize the client using Vite's environment variable standard
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const modelName = "gemini-2.5-flash";

interface FallbackPuzzle extends PuzzleData {
  type: PuzzleType;
}

// A diverse set of fallback puzzles to use when the API rate limit is reached
const FALLBACK_PUZZLES: FallbackPuzzle[] = [
  // RIDDLES
  {
    type: PuzzleType.RIDDLE,
    question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answer: "Echo",
    hint: "It involves sound reflection.",
    difficulty: 1
  },
  {
    type: PuzzleType.RIDDLE,
    question: "The more of this there is, the less you see. What is it?",
    answer: "Darkness",
    hint: "It happens at night.",
    difficulty: 1
  },
  {
    type: PuzzleType.RIDDLE,
    question: "What has keys, but can't put locks on anything?",
    answer: "Piano",
    hint: "It makes music.",
    difficulty: 2
  },
  
  // LOGIC
  {
    type: PuzzleType.LOGIC,
    question: "A man pushes his car to a hotel and tells the owner he's bankrupt. Why?",
    answer: "He is playing Monopoly",
    hint: "It's a board game.",
    difficulty: 3
  },
  {
    type: PuzzleType.LOGIC,
    question: "You have a 3-gallon jug and a 5-gallon jug. How do you measure exactly 4 gallons?",
    answer: "Fill 5, pour into 3. Empty 3. Pour remaining 2 from 5 into 3. Fill 5. Pour into 3 until full.",
    hint: "It involves multiple steps of pouring.",
    difficulty: 5
  },

  // MATH
  {
    type: PuzzleType.MATH,
    question: "What number comes next in the sequence: 1, 1, 2, 3, 5, 8, ...?",
    answer: "13",
    hint: "Add the previous two numbers together.",
    difficulty: 2
  },
  {
    type: PuzzleType.MATH,
    question: "How can you add eight 8s to get the number 1,000?",
    answer: "888 + 88 + 8 + 8 + 8 = 1000",
    hint: "Think about place values.",
    difficulty: 4
  },

  // LATERAL
  {
    type: PuzzleType.LATERAL,
    question: "A man is looking at a picture of someone. His friend asks who it is. The man replies, 'Brothers and sisters I have none, but that man's father is my father's son.' Who is in the picture?",
    answer: "His son",
    hint: "Break it down: 'My father's son' is the speaker himself.",
    difficulty: 5
  },
  {
    type: PuzzleType.LATERAL,
    question: "A cowboy rides into town on Friday, stays for three days and leaves on Friday. How did he do it?",
    answer: "His horse's name is Friday",
    hint: "Friday isn't just a day of the week.",
    difficulty: 3
  },

  // EMOJI
  {
    type: PuzzleType.EMOJI,
    question: "🦁 👑",
    answer: "The Lion King",
    hint: "A Disney movie.",
    difficulty: 1
  },
  {
    type: PuzzleType.EMOJI,
    question: "👻 🚫",
    answer: "Ghostbusters",
    hint: "Who you gonna call?",
    difficulty: 1
  },
  {
    type: PuzzleType.EMOJI,
    question: "🌎 🐒 🐒",
    answer: "Planet of the Apes",
    hint: "Sci-fi movie franchise.",
    difficulty: 2
  },

  // WORD_ASSOCIATION
  {
    type: PuzzleType.WORD_ASSOCIATION,
    question: "Find the word connecting: Fish, Mine, Rush",
    answer: "Gold",
    hint: "Goldfish, Gold mine, Gold rush.",
    difficulty: 3
  },
  {
    type: PuzzleType.WORD_ASSOCIATION,
    question: "Find the word connecting: Cottage, Swiss, Cake",
    answer: "Cheese",
    hint: "It's a dairy product.",
    difficulty: 2
  },

  // SEQUENCE
  {
    type: PuzzleType.SEQUENCE,
    question: "O, T, T, F, F, S, S, ... What comes next?",
    answer: "E",
    hint: "One, Two, Three, Four...",
    difficulty: 4
  },
  {
    type: PuzzleType.SEQUENCE,
    question: "J, F, M, A, M, J, ... What comes next?",
    answer: "J",
    hint: "Months of the year.",
    difficulty: 3
  },

  // TRIVIA_TWIST
  {
    type: PuzzleType.TRIVIA_TWIST,
    question: "What is the only US state name that can be typed on one row of a standard QWERTY keyboard?",
    answer: "Alaska",
    hint: "It's a cold place.",
    difficulty: 4
  },
  {
    type: PuzzleType.TRIVIA_TWIST,
    question: "I am the only planet in the solar system not named after a god. What am I?",
    answer: "Earth",
    hint: "You are standing on it.",
    difficulty: 2
  }
];

const TYPE_SPECIFIC_INSTRUCTIONS: Record<string, string> = {
  RIDDLE: "Create a clever riddle using metaphor and wordplay. The answer should be a single word or short concept. Do not use common nursery riddles.",
  LOGIC: "Create a deductive reasoning puzzle. Example: 'Knights and Knaves', 'River crossing', or 'Grid logic'. Ensure it is solvable with the info given.",
  MATH: "Create a math puzzle that relies on pattern recognition or a trick, rather than heavy calculation. Examples: Sequence completion, geometric paradoxes, or algebraic word problems.",
  LATERAL: "Create a lateral thinking puzzle describing a strange scenario with a logical but non-obvious explanation. (e.g., 'The man in the elevator').",
  EMOJI: "Create an emoji rebus. The 'question' MUST be a string of 2-5 emojis representing a famous movie, book, idiom, or song. The answer is the title/phrase.",
  WORD_ASSOCIATION: "Create a 'Remote Associates' puzzle. Provide 3 disparate words that are all linked by a 4th word (e.g. 'Falling, Actor, Dust' -> 'Star'). Format question as: 'Find the word linked to: [Word1], [Word2], [Word3]'.",
  SEQUENCE: "Create a sequence puzzle. Provide a series of numbers, letters, or symbols following a hidden rule and ask for the next term.",
  TRIVIA_TWIST: "Ask a trivia question that requires second-order thinking. Not just a fact, but a riddle about a fact. (e.g., 'I am the only US President who...') "
};

// Helper to wait for a specified duration
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generates a puzzle based on the level type and difficulty.
 * Handles rate limits with retries and fallbacks.
 */
export const generatePuzzle = async (
  type: PuzzleType, 
  levelId: number, 
  history: string[] = []
): Promise<PuzzleData> => {
  const avoidList = history.slice(-20);
  const negativeConstraint = avoidList.length > 0 
    ? `\nIMPORTANT: Do NOT generate the following puzzles or anything very similar to them:\n- ${avoidList.join("\n- ")}`
    : "";

  const typeInstruction = TYPE_SPECIFIC_INSTRUCTIONS[type] || "Create a unique brain teaser.";

  const prompt = `
    Create a unique brain teaser puzzle.
    Type: ${type}
    Difficulty Level: ${levelId} (on a scale of 1-10).
    ${negativeConstraint}
    
    Specific Instructions for ${type} (Strictly Follow):
    ${typeInstruction}

    General Requirements:
    - Return strictly valid JSON.
    - 'question': The puzzle text.
    - 'answer': The solution (concise).
    - 'hint': A helpful clue that doesn't spoil the answer immediately.
    - 'difficulty': Integer 1-10.
  `;

  // Retry up to 3 times with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The puzzle question or content" },
              answer: { type: Type.STRING, description: "The correct answer or solution" },
              hint: { type: Type.STRING, description: "A subtle clue" },
              difficulty: { type: Type.NUMBER, description: "Estimated difficulty 1-10" }
            },
            required: ["question", "answer", "hint"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as PuzzleData;
      }
    } catch (error: any) {
      console.warn(`Attempt ${attempt + 1} failed:`, error);
      
      if (error.toString().includes('429') || error.toString().includes('RESOURCE_EXHAUSTED')) {
        if (attempt < 2) {
          await wait(1000 * Math.pow(2, attempt));
          continue;
        }
      } else {
        break;
      }
    }
  }

  // Fallback if all retries fail
  console.log("Using fallback puzzle due to API unavailability.");
  
  // Try to find fallbacks of the correct type first
  let possibleFallbacks = FALLBACK_PUZZLES.filter(p => p.type === type && !history.includes(p.question));
  
  // If no type-specific fallbacks are available (or all seen), broaden search to any unseen puzzle
  if (possibleFallbacks.length === 0) {
      possibleFallbacks = FALLBACK_PUZZLES.filter(p => !history.includes(p.question));
  }
  
  // If EVERYTHING has been seen, just use any fallback of the correct type to at least keep the theme
  if (possibleFallbacks.length === 0) {
      possibleFallbacks = FALLBACK_PUZZLES.filter(p => p.type === type);
  }
  
  // Absolute last resort: any puzzle
  if (possibleFallbacks.length === 0) {
      possibleFallbacks = FALLBACK_PUZZLES;
  }

  const randomIndex = Math.floor(Math.random() * possibleFallbacks.length);
  const fallback = possibleFallbacks[randomIndex];
  
  // Return just the PuzzleData part (exclude 'type' field which is internal to fallback logic)
  return {
      question: fallback.question,
      answer: fallback.answer,
      hint: fallback.hint,
      difficulty: fallback.difficulty
  };
};

/**
 * Validates the user's answer.
 * Handles rate limits by falling back to simple string matching.
 */
export const validateAnswer = async (
  puzzle: PuzzleData,
  userAnswer: string
): Promise<ValidationResult> => {
  const prompt = `
    The user was asked this puzzle: "${puzzle.question}"
    The canonical answer is: "${puzzle.answer}"
    The user provided this answer: "${userAnswer}"
    
    Determine if the user's answer is correct. 
    It doesn't need to be an exact string match, but it must be semantically correct.
    For riddles and logic, synonyms are okay.
    For math, the number must be equivalent.
    
    Return a JSON object with:
    - isCorrect: boolean
    - explanation: A short, encouraging sentence explaining why it is right or wrong.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          },
          required: ["isCorrect", "explanation"]
        }
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text);
      return {
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        scoreDelta: result.isCorrect ? puzzle.difficulty * 100 : 0
      };
    }
    throw new Error("Empty validation response");
  } catch (error) {
    console.error("Validation error, using fallback matcher:", error);
    
    // Fallback simple validation
    const normalizedUser = userAnswer.toLowerCase().trim();
    const normalizedAnswer = puzzle.answer.toLowerCase().trim();
    
    // Check for exact match or if the answer is contained in the user string
    const isMatch = normalizedUser === normalizedAnswer || 
                   (normalizedUser.length > 2 && normalizedUser.includes(normalizedAnswer)) ||
                   (normalizedAnswer.length > 2 && normalizedAnswer.includes(normalizedUser));

    return {
      isCorrect: isMatch,
      explanation: isMatch ? "Correct!" : `Incorrect. The answer was ${puzzle.answer}`,
      scoreDelta: isMatch ? 50 : 0
    };
  }
};
