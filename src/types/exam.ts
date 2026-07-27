export type PageKey =
  | "dashboard"
  | "exams"
  | "assignments"
  | "playground"
  | "results"
  | "settings";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "GRADED";

export interface AttemptSummary {
  id: string;
  status: AttemptStatus;
  percentage: string | number | null;
  score?: string | number | null;
  maxScore?: string | number | null;
  attemptNumber: number;
  startedAt?: string;
  submittedAt?: string | null;
  lockedAt?: string | null;
  lockReason?: string | null;
  violationCount?: number;
  lastViolationAt?: string | null;
}

export interface StudentExam {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  isAdaptive: boolean;
  durationMinutes?: number | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  maxAttempts: number;
  classroom: { id: string; name: string };
  subject: { id: string; name: string };
  attempts: AttemptSummary[];
  _count: { items: number };
}

export interface ExamQuestion {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY" | "FILL_IN_BLANK";
  difficulty: string;
  prompt: string;
  options?: Array<{ id: string; text: string }> | null;
  score: string | number;
  position: number;
  progress: { answered: number; total: number; currentDifficulty: string };
}

export interface Attempt {
  id: string;
  attemptNumber: number;
  startedAt: string;
  lockedAt?: string | null;
  lockReason?: string | null;
  violationCount?: number;
  lastViolationAt?: string | null;
}

export type ExamViolationType = "TAB_HIDDEN" | "WINDOW_BLUR" | "COPY" | "PASTE" | "CUT" | "PAGE_EXIT";

export interface AttemptLockStatus {
  id: string;
  status: AttemptStatus;
  lockedAt: string | null;
  lockReason: string | null;
  violationCount: number;
  lastViolationAt: string | null;
}

export interface AnswerResult {
  answer: { id: string; score: string | number | null; isCorrect: boolean | null; aiFeedback?: string | null };
  adaptiveState: { currentDifficulty: string; correctStreak: number; incorrectStreak: number };
  nextQuestion: ExamQuestion | null;
}

export interface LearningReport {
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  group?: "STRONG" | "AVERAGE" | "NEEDS_SUPPORT";
}

export interface AttemptResult {
  id: string;
  status: string;
  attemptNumber: number;
  score: string | number | null;
  maxScore: string | number | null;
  percentage: string | number | null;
  aiReport?: LearningReport | null;
  startedAt: string;
  submittedAt?: string | null;
  exam: { id: string; title: string; isAdaptive: boolean; classroom: { id: string; name: string }; subject: { id: string; name: string } };
  answers: Array<{ id: string; response: unknown; score: string | number | null; isCorrect: boolean | null; aiFeedback?: string | null; question: { id: string; type: string; prompt: string; position: number; maxScore: string | number } | null }>;
}
