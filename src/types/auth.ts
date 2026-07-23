export interface StudentProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | string;
  organization: { id: string; name: string; code: string };
  studentProfile?: { id: string; studentCode: string } | null;
}

export interface LoginResponse {
  accessToken: string;
  user: Omit<StudentProfile, "organization" | "studentProfile">;
}
