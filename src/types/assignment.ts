export interface StudentAssignmentSubmission {
  id: string;
  content?: string | null;
  attachmentUrl?: string | null;
  attachmentUrls?: string[] | null;
  status: "SUBMITTED" | "GRADED";
  score?: string | number | null;
  feedback?: string | null;
  grade?: string | null;
  assessment?: string | null;
  submittedAt: string;
  groupName?: string | null;
  gradingMode?: "SHARED" | "INDIVIDUAL" | null;
  members: AssignmentGroupMember[];
  canEdit?: boolean;
}

export interface AssignmentStudent {
  id: string;
  studentCode: string;
  user: { firstName: string; lastName: string };
}

export interface AssignmentGroupMember {
  studentId: string;
  role: string;
  score?: string | number | null;
  feedback?: string | null;
  student: AssignmentStudent;
}

export interface AssignmentSubmitPayload {
  content?: string;
  attachmentUrl?: string;
  attachmentUrls?: string[];
  groupName?: string;
  submitterRole?: string;
  members?: Array<{ studentId: string; role: string }>;
}

export interface StudentAssignment {
  id: string;
  title: string;
  description: string;
  maxScore: string | number;
  dueAt: string;
  status: "PUBLISHED" | "CLOSED";
  type: "GENERAL" | "CODE";
  codeLanguage?: "C" | "CPP" | "CSHARP" | "PYTHON" | null;
  aiGradingEnabled: boolean;
  aiGradingModel?: string | null;
  isGroupWork: boolean;
  minGroupSize: number;
  maxGroupSize: number;
  classroom: { id: string; name: string };
  subject: { id: string; name: string };
  submissions: StudentAssignmentSubmission[];
  eligibleMembers: AssignmentStudent[];
}

export interface CodeRunResult {
  statusId: number;
  status: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  message: string;
  time: number | null;
  memory: number | null;
}
