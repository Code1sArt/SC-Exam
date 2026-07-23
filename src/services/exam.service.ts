import { api, jsonRequest } from "./api";
import type { AnswerResult, Attempt, AttemptLockStatus, AttemptResult, ExamQuestion, ExamViolationType, StudentExam } from "../types/exam";

export const examService = {
  list: (token: string) => api<StudentExam[]>("/exams", {}, token),
  start: (token: string, examId: string) => api<{ attempt: Attempt; nextQuestion: ExamQuestion | null }>(`/exams/${examId}/start`, { method: "POST" }, token),
  next: (token: string, attemptId: string) => api<ExamQuestion | null>(`/exams/attempts/${attemptId}/next`, {}, token),
  answer: (token: string, attemptId: string, questionId: string, response: unknown) => api<AnswerResult>(`/exams/attempts/${attemptId}/questions/${questionId}/answer`, jsonRequest({ response }), token),
  submit: (token: string, attemptId: string) => api<AttemptResult>(`/exams/attempts/${attemptId}/submit`, { method: "POST" }, token),
  result: (token: string, attemptId: string) => api<AttemptResult>(`/exams/attempts/${attemptId}/result`, {}, token),
  status: (token: string, attemptId: string) => api<AttemptLockStatus>(`/exams/attempts/${attemptId}/status`, {}, token),
  violation: (token: string, attemptId: string, type: ExamViolationType, keepalive = false) => api<AttemptLockStatus>(`/exams/attempts/${attemptId}/violation`, { ...jsonRequest({ type }), keepalive }, token),
};
