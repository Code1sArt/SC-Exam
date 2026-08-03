import type { CodeRunResult } from "./assignment";

export type PlaygroundLanguage = "CPP" | "CSHARP" | "PYTHON";

export interface PlaygroundStatus {
  playgroundEnabled: boolean;
}

export type PlaygroundDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface PlaygroundProblem {
  id: string;
  title: string;
  description?: string | null;
  difficulty: PlaygroundDifficulty;
  driveUrl: string;
  previewUrl: string;
  position: number;
}

export type PlaygroundRunResult = CodeRunResult;

export interface PlaygroundAdvice {
  summary: string;
  suggestions: Array<{
    title: string;
    detail: string;
    line?: number;
  }>;
  nextStep: string;
}
