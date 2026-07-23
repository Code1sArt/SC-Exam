export interface AssessmentRecord {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  gradedAt: string | null;
}

export interface SubjectRecord {
  classroom: { id: string; name: string; gradeLevel: string | null; academicYear: string };
  subject: { id: string; code: string; name: string };
  exams: AssessmentRecord[];
  assignments: AssessmentRecord[];
  score: number;
  maxScore: number;
  percentage: number | null;
  grade: string | null;
}

export interface LearningRecords {
  gradeScale: Record<string, number>;
  classrooms: Array<{ classroom: SubjectRecord["classroom"]; subjects: SubjectRecord[] }>;
}
