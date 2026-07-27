import type { CodeRunResult } from "./assignment";

export type PlaygroundLanguage = "CPP" | "CSHARP" | "PYTHON";

export interface PlaygroundStatus {
  playgroundEnabled: boolean;
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
