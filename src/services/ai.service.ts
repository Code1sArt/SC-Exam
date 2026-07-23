import { api } from "./api";

export interface StudentAiStatus {
  status: "AVAILABLE" | "DEGRADED" | "UNAVAILABLE" | "MOCK" | "DISABLED";
  feedback: boolean;
  report: boolean;
  checkedAt: string;
}

export const aiService = {
  status: (token: string) => api<StudentAiStatus>("/ai/student-status", {}, token),
};
