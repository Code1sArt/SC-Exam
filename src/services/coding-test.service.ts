import { api, jsonRequest } from "./api";
import type { CodeRunResult } from "../types/assignment";
import type { CodingAttempt, CodingStart, StudentCodingTest } from "../types/coding-test";
export const codingTestService = {
  list: (token: string) => api<StudentCodingTest[]>("/coding-tests", {}, token),
  start: (token: string, id: string) => api<CodingStart>(`/coding-tests/${id}/start`, jsonRequest({}), token),
  submit: (token: string, attemptId: string, answers: Array<{ problemId: string; sourceCode: string }>) => api<CodingAttempt>(`/coding-tests/attempts/${attemptId}/submit`, jsonRequest({ answers }), token),
  status: (token: string, attemptId: string) => api<CodingAttempt>(`/coding-tests/attempts/${attemptId}/status`, {}, token),
  run: (token: string, testId: string, problemId: string, sourceCode: string, stdin: string) => api<CodeRunResult>(`/coding-tests/${testId}/run-code`, jsonRequest({ problemId, sourceCode, stdin: stdin || undefined }), token),
};
