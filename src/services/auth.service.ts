import { api, jsonRequest } from "./api";
import type { LoginResponse, StudentProfile } from "../types/auth";

export const authService = {
  login: (identifier: string, password: string) => api<LoginResponse>("/auth/login", jsonRequest({ identifier, password })),
  me: (token: string) => api<StudentProfile>("/auth/me", {}, token),
  update: (token: string, payload: Record<string, unknown>) => api<StudentProfile>("/auth/me", jsonRequest(payload, "PATCH"), token),
};
