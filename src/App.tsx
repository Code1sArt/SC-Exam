import { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import { StudentLayout } from "./components/layout/StudentLayout";
import { AppLoading, LoadingBlock } from "./components/ui/StateViews";
import { DashboardPage } from "./pages/DashboardPage";
import { ExamsPage } from "./pages/ExamsPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { LoginPage } from "./pages/LoginPage";
import { ResultsPage } from "./pages/ResultsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { TakingExamPage } from "./pages/TakingExamPage";
import { CodingTestsPage } from "./pages/CodingTestsPage";
import { ApiError } from "./services/api";
import { authService } from "./services/auth.service";
import { aiService, type StudentAiStatus } from "./services/ai.service";
import { assignmentService } from "./services/assignment.service";
import { examService } from "./services/exam.service";
import { recordService } from "./services/record.service";
import { playgroundService } from "./services/playground.service";
import { codingTestService } from "./services/coding-test.service";
import type { StudentProfile } from "./types/auth";
import type {
  AssignmentSubmitPayload,
  StudentAssignment,
} from "./types/assignment";
import type { AttemptResult, PageKey, StudentExam } from "./types/exam";
import type { LearningRecords } from "./types/record";
import type { PlaygroundLanguage } from "./types/playground";
import type { StudentCodingTest } from "./types/coding-test";

const TOKEN_KEY = "lab_edu_student_token";
const PAGE_KEY = "lab_edu_student_page";
const headings: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: "หน้าหลัก", subtitle: "ภาพรวมแบบทดสอบและพัฒนาการของคุณ" },
  exams: {
    title: "แบบทดสอบของฉัน",
    subtitle: "เลือกแบบทดสอบที่ได้รับมอบหมายจากครู",
  },
  "coding-tests": { title: "Coding Test", subtitle: "สอบเขียนโค้ด เลือกโจทย์ และติดตามสถานะคิวตรวจ" },
  assignments: {
    title: "งานที่ได้รับมอบหมาย",
    subtitle: "ส่งงาน ติดตามการตรวจ และดูคะแนนของคุณ",
  },
  playground: {
    title: "Playground",
    subtitle: "ทดลองเขียนและรันโค้ด C++, C# และ Python ได้อย่างอิสระ",
  },
  results: {
    title: "ผลการเรียนรู้",
    subtitle: "เกรดรวมจากคะแนนสอบและงาน แยกตามห้องเรียนและรายวิชา",
  },
  settings: { title: "ตั้งค่าบัญชี", subtitle: "จัดการชื่อและรหัสผ่านของคุณ" },
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [codingTests, setCodingTests] = useState<StudentCodingTest[]>([]);
  const [records, setRecords] = useState<LearningRecords | null>(null);
  const [page, setPage] = useState<PageKey>("dashboard");
  const [activeExam, setActiveExam] = useState<StudentExam | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [aiStatus, setAiStatus] = useState<StudentAiStatus | null>(null);
  const [playgroundEnabled, setPlaygroundEnabled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(PAGE_KEY);
    setToken(null);
    setProfile(null);
    setExams([]);
    setAssignments([]);
    setCodingTests([]);
    setRecords(null);
    setActiveExam(null);
    setResult(null);
    setAiStatus(null);
    setPlaygroundEnabled(false);
  }, []);
  const loadExams = useCallback(
    async (accessToken: string) => {
      setPageLoading(true);
      try {
        setExams(await examService.list(accessToken));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        else await showError(error);
      } finally {
        setPageLoading(false);
      }
    },
    [logout],
  );
  const loadRecords = useCallback(
    async (accessToken: string) => {
      try {
        setRecords(await recordService.mine(accessToken));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        else await showError(error);
      }
    },
    [logout],
  );
  const loadCodingTests = useCallback(async (accessToken: string) => { try { setCodingTests(await codingTestService.list(accessToken)); } catch (error) { if (error instanceof ApiError && error.status === 401) logout(); else await showError(error); } }, [logout]);
  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    const savedPage = sessionStorage.getItem(PAGE_KEY);
    setToken(saved);
    if (
      savedPage &&
      Object.prototype.hasOwnProperty.call(headings, savedPage)
    ) {
      setPage(savedPage as PageKey);
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) sessionStorage.setItem(PAGE_KEY, page);
  }, [hydrated, page]);
  useEffect(() => {
    if (!token) return;
    let ignore = false;
    void (async () => {
      setPageLoading(true);
      try {
        const user = await authService.me(token);
        if (user.role !== "STUDENT") {
          await Swal.fire({
            icon: "warning",
            title: "บัญชีนี้ไม่ใช่นักเรียน",
            text: "กรุณาเข้าสู่ระบบผ่านหน้าสำหรับผู้ดูแลหรือครู",
          });
          logout();
          return;
        }
        const [examRows, codingRows, assignmentRows, recordRows] = await Promise.all([
          examService.list(token),
          codingTestService.list(token),
          assignmentService.list(token),
          recordService.mine(token),
        ]);
        if (!ignore) {
          setProfile(user);
          setExams(examRows);
          setCodingTests(codingRows);
          setAssignments(assignmentRows);
          setRecords(recordRows);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) logout();
        else await showError(error);
      } finally {
        if (!ignore) setPageLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [logout, token]);
  useEffect(() => {
    if (!token) return;
    let ignore = false;
    const check = async () => {
      try {
        const status = await aiService.status(token);
        if (!ignore) setAiStatus(status);
      } catch {
        if (!ignore)
          setAiStatus({
            status: "UNAVAILABLE",
            feedback: false,
            report: false,
            checkedAt: new Date().toISOString(),
          });
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [token]);
  useEffect(() => {
    if (!token) return;
    let ignore = false;
    const check = async () => {
      try {
        const status = await playgroundService.status(token);
        if (!ignore) {
          setPlaygroundEnabled(status.playgroundEnabled);
          if (!status.playgroundEnabled)
            setPage((current) =>
              current === "playground" ? "dashboard" : current,
            );
        }
      } catch {
        if (!ignore) setPlaygroundEnabled(false);
      }
    };
    void check();
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const session = await authService.login(email, password);
      if (session.user.role !== "STUDENT")
        throw new Error("บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบนักเรียน");
      sessionStorage.setItem(TOKEN_KEY, session.accessToken);
      setToken(session.accessToken);
      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        timer: 900,
        showConfirmButton: false,
      });
    } catch (error) {
      await showError(error);
    } finally {
      setLoading(false);
    }
  };
  const confirmLogout = async () => {
    const answer = await Swal.fire({
      icon: "question",
      title: "ออกจากระบบ?",
      text: "คุณจะต้องเข้าสู่ระบบอีกครั้งเพื่อใช้งานต่อ",
      showCancelButton: true,
      confirmButtonText: "ออกจากระบบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc5c68",
    });
    if (answer.isConfirmed) logout();
  };
  const takeExam = async (exam: StudentExam) => {
    if (!exam.attempts.some((item) => item.status === "IN_PROGRESS")) {
      const answer = await Swal.fire({
        icon: "info",
        title: exam.title,
        html: `<p>จำนวน ${exam.questionCount ?? exam._count.items} ข้อ · ${exam.durationMinutes ? `${exam.durationMinutes} นาที` : "ไม่จำกัดเวลา"}</p><div style="margin-top:14px;padding:12px;text-align:left;border-radius:8px;background:#fff7e2;font-size:11px;line-height:1.7"><b>ระบบควบคุมการสอบ</b><br>ห้ามสลับแท็บ พับหรือออกจากหน้าจอ และห้ามคัดลอก วาง หรือตัดข้อความ หากตรวจพบข้อสอบจะถูกล็อกทันที</div>`,
        showCancelButton: true,
        confirmButtonText: "รับทราบและเริ่มสอบ",
        cancelButtonText: "ยกเลิก",
      });
      if (!answer.isConfirmed) return;
    }
    setActiveExam(exam);
  };
  const completeExam = async (completed: AttemptResult) => {
    setResult(completed);
    setActiveExam(null);
    setPage("results");
    await loadExams(token!);
    await loadRecords(token!);
    await Swal.fire({
      icon: "success",
      title: "ส่งข้อสอบเรียบร้อย",
      text: `ได้คะแนน ${Number(completed.percentage ?? 0).toFixed(0)}%`,
    });
  };
  const openResult = async (attemptId: string) => {
    if (!token) return;
    setPageLoading(true);
    try {
      setResult(await examService.result(token, attemptId));
      setPage("results");
    } catch (error) {
      await showError(error);
    } finally {
      setPageLoading(false);
    }
  };
  const submitAssignment = async (
    id: string,
    payload: AssignmentSubmitPayload,
  ) => {
    if (!token) return false;
    setLoading(true);
    try {
      const submission = await assignmentService.submit(token, id, payload);
      setAssignments(await assignmentService.list(token));
      await loadRecords(token);
      await Swal.fire({
        icon: "success",
        title:
          submission.status === "GRADED"
            ? "ตรวจงานอัตโนมัติเรียบร้อย"
            : "ส่งงานเรียบร้อย",
        text:
          submission.status === "GRADED"
            ? `ได้ ${Number(submission.score ?? 0)} คะแนน — ${submission.feedback ?? ""}`
            : "รอครูตรวจและให้คะแนน",
        timer: submission.status === "GRADED" ? undefined : 1000,
        showConfirmButton: submission.status === "GRADED",
      });
      return true;
    } catch (error) {
      await showError(error);
      return false;
    } finally {
      setLoading(false);
    }
  };
  const runAssignmentCode = (id: string, sourceCode: string, stdin: string) => {
    if (!token) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    return assignmentService.runCode(token, id, sourceCode, stdin);
  };
  const changePage = (next: PageKey) => {
    if (next === "playground" && !playgroundEnabled) return;
    setResult(null);
    setPage(next);
  };
  const runPlaygroundCode = (
    language: PlaygroundLanguage,
    sourceCode: string,
    stdin: string,
  ) => {
    if (!token) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    return playgroundService.run(token, language, sourceCode, stdin);
  };
  const askPlaygroundAdvice = (
    language: PlaygroundLanguage,
    sourceCode: string,
  ) => {
    if (!token) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    return playgroundService.advice(token, language, sourceCode);
  };
  const loadPlaygroundProblems = useCallback(() => {
    if (!token) throw new Error("กรุณาเข้าสู่ระบบอีกครั้ง");
    return playgroundService.problems(token);
  }, [token]);
  const updateName = async (firstName: string, lastName: string) => {
    if (!token) return;
    setLoading(true);
    try {
      setProfile(await authService.update(token, { firstName, lastName }));
      await Swal.fire({
        icon: "success",
        title: "บันทึกชื่อเรียบร้อย",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error) {
      await showError(error);
    } finally {
      setLoading(false);
    }
  };
  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
    confirm: string,
    form: HTMLFormElement,
  ) => {
    if (!token) return;
    if (newPassword !== confirm) {
      await Swal.fire({ icon: "warning", title: "รหัสผ่านใหม่ไม่ตรงกัน" });
      return;
    }
    setLoading(true);
    try {
      await authService.update(token, { currentPassword, newPassword });
      form.reset();
      await Swal.fire({ icon: "success", title: "เปลี่ยนรหัสผ่านแล้ว" });
    } catch (error) {
      await showError(error);
    } finally {
      setLoading(false);
    }
  };
  if (!hydrated) return <AppLoading />;
  if (!token) return <LoginPage loading={loading} onLogin={login} />;
  if (!profile) return <AppLoading />;
  if (activeExam)
    return (
      <TakingExamPage
        token={token}
        exam={activeExam}
        aiStatus={aiStatus}
        onCancel={() => {
          setActiveExam(null);
          void loadExams(token);
        }}
        onComplete={completeExam}
        onUnauthorized={logout}
      />
    );
  const content = pageLoading ? (
    <LoadingBlock />
  ) : page === "dashboard" ? (
    <DashboardPage
      profile={profile}
      exams={exams}
      assignments={assignments}
      onTake={takeExam}
      onResult={openResult}
      onAllExams={() => changePage("exams")}
      onAllAssignments={() => changePage("assignments")}
    />
  ) : page === "exams" ? (
    <ExamsPage exams={exams} onTake={takeExam} onResult={openResult} />
  ) : page === "coding-tests" ? (
    <CodingTestsPage token={token} rows={codingTests} onRefresh={() => loadCodingTests(token)} onRecords={() => loadRecords(token)} />
  ) : page === "assignments" ? (
    <AssignmentsPage
      rows={assignments}
      saving={loading}
      onSubmit={submitAssignment}
      onRun={runAssignmentCode}
    />
  ) : page === "playground" && playgroundEnabled ? (
    <PlaygroundPage
      aiStatus={aiStatus}
      onLoadProblems={loadPlaygroundProblems}
      onRun={runPlaygroundCode}
      onAdvice={askPlaygroundAdvice}
    />
  ) : page === "results" ? (
    <ResultsPage
      exams={exams}
      assignments={assignments}
      records={records}
      detail={result}
      onOpen={openResult}
    />
  ) : (
    <SettingsPage
      profile={profile}
      loading={loading}
      onName={updateName}
      onPassword={updatePassword}
    />
  );
  return (
    <StudentLayout
      profile={profile}
      page={page}
      aiStatus={aiStatus}
      mobileOpen={mobileOpen}
      title={headings[page].title}
      subtitle={headings[page].subtitle}
      onPage={changePage}
      onMobile={setMobileOpen}
      onLogout={confirmLogout}
      playgroundEnabled={playgroundEnabled}
    >
      {content}
    </StudentLayout>
  );
}

async function showError(error: unknown) {
  await Swal.fire({
    icon: "error",
    title: "ไม่สามารถดำเนินการได้",
    text: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
  });
}
