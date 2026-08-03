import { api, jsonRequest } from "./api";
import type {
  PlaygroundAdvice,
  PlaygroundLanguage,
  PlaygroundProblem,
  PlaygroundRunResult,
  PlaygroundStatus,
} from "../types/playground";

export const playgroundService = {
  status: (token: string) =>
    api<PlaygroundStatus>("/playground/status", {}, token),
  problems: (token: string) =>
    api<PlaygroundProblem[]>("/playground/problems", {}, token),
  run: (
    token: string,
    language: PlaygroundLanguage,
    sourceCode: string,
    stdin: string,
  ) =>
    api<PlaygroundRunResult>(
      "/playground/run",
      jsonRequest({ language, sourceCode, stdin: stdin || undefined }),
      token,
    ),
  advice: (
    token: string,
    language: PlaygroundLanguage,
    sourceCode: string,
  ) =>
    api<PlaygroundAdvice>(
      "/playground/advice",
      jsonRequest({ language, sourceCode }),
      token,
    ),
};
