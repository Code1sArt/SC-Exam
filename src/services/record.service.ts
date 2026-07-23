import { api } from "./api";
import type { LearningRecords } from "../types/record";

export const recordService = {
  mine: (token: string) => api<LearningRecords>("/records/me", {}, token),
};
