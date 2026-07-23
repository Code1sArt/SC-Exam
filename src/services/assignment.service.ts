import { api, jsonRequest } from "./api";
import type {
  CodeRunResult,
  StudentAssignment,
  StudentAssignmentSubmission,
  AssignmentSubmitPayload,
} from "../types/assignment";

export const assignmentService = {
  list: (token: string) => api<StudentAssignment[]>("/assignments", {}, token),
  submit: (token: string, id: string, payload: AssignmentSubmitPayload) =>
    api<StudentAssignmentSubmission>(
      `/assignments/${id}/submit`,
      jsonRequest(payload),
      token,
    ),
  runCode: (token: string, id: string, sourceCode: string, stdin: string) =>
    api<CodeRunResult>(
      `/assignments/${id}/run-code`,
      jsonRequest({ sourceCode, stdin: stdin || undefined }),
      token,
    ),
};
