import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { ExamCompanions } from "../components/exam/ExamCompanions";
import { QuestionInput } from "../components/exam/QuestionInput";
import { AiStatusBadge } from "../components/ui/AiStatusBadge";
import type { StudentAiStatus } from "../services/ai.service";
import { ApiError } from "../services/api";
import { examService } from "../services/exam.service";
import type {
  AnswerResult,
  AttemptLockStatus,
  AttemptResult,
  ExamQuestion,
  ExamViolationType,
  StudentExam,
} from "../types/exam";

const responseFor = (question: ExamQuestion, value: string) =>
  question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE"
    ? { selectedOptionId: value }
    : { value: value.trim() };
const difficulty: Record<string, string> = {
  VERY_EASY: "ง่ายมาก",
  EASY: "ง่าย",
  MEDIUM: "ปานกลาง",
  HARD: "ยาก",
  VERY_HARD: "ยากมาก",
};
const violationLabels: Record<string, string> = {
  TAB_HIDDEN: "สลับแท็บหรือพับหน้าจอ",
  WINDOW_BLUR: "ออกจากหน้าต่างทำข้อสอบ",
  COPY: "คัดลอกข้อความ",
  PASTE: "วางข้อความ",
  CUT: "ตัดข้อความ",
  PAGE_EXIT: "ออกหรือปิดหน้าทำข้อสอบ",
};

function QuestionImage({ url, prompt }: { url: string; prompt: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (failed)
    return (
      <div className="mt-5 rounded-lg border border-[#efd2a9] bg-[#fff9ed] p-3 text-center text-[11px] text-[#9a612f]">
        ไม่สามารถแสดงรูปประกอบได้ กรุณาแจ้งผู้คุมสอบ
      </div>
    );
  const driveMatch = url.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/,
  );
  const src = driveMatch
    ? `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
    : url;
  return (
    <figure className="mt-5 overflow-hidden rounded-lg border border-[#dce7e2] bg-[#f7faf8] p-2">
      <img
        className="mx-auto max-h-[420px] w-full rounded-md object-contain"
        src={src}
        alt={`รูปประกอบคำถาม: ${prompt}`}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    </figure>
  );
}

export function TakingExamPage({
  token,
  exam,
  aiStatus,
  onCancel,
  onComplete,
  onUnauthorized,
}: {
  token: string;
  exam: StudentExam;
  aiStatus: StudentAiStatus | null;
  onCancel: () => void;
  onComplete: (result: AttemptResult) => void;
  onUnauthorized: () => void;
}) {
  const active = exam.attempts.find((item) => item.status === "IN_PROGRESS");
  const [attemptId, setAttemptId] = useState(active?.id || "");
  const [startedAt, setStartedAt] = useState(active?.startedAt || "");
  const [question, setQuestion] = useState<ExamQuestion | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerResult | null>(null);
  const [lock, setLock] = useState<AttemptLockStatus | null>(
    active?.lockedAt ? lockStatusFromAttempt(active) : null,
  );
  const [loading, setLoading] = useState(!active?.lockedAt);
  const [saving, setSaving] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(null);
  const violationReported = useRef(Boolean(active?.lockedAt));
  const checkingUnlock = useRef(false);
  const answerInFlight = useRef(false);

  const finish = useCallback(
    async (id = attemptId) => {
      if (!id || saving) return;
      setSaving(true);
      try {
        const result = await examService.submit(token, id);
        onComplete(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 423)
          setLock(await examService.status(token, id));
        else await showError(error, onUnauthorized);
      } finally {
        setSaving(false);
      }
    },
    [attemptId, onComplete, onUnauthorized, saving, token],
  );

  useEffect(() => {
    let ignore = false;
    void (async () => {
      if (active?.lockedAt) {
        setAttemptId(active.id);
        setStartedAt(active.startedAt || new Date().toISOString());
        setLoading(false);
        return;
      }
      try {
        if (active) {
          const next = await examService.next(token, active.id);
          if (!ignore) {
            setQuestion(next);
            setAttemptId(active.id);
            setStartedAt(active.startedAt || new Date().toISOString());
            if (!next) await finish(active.id);
          }
        } else {
          const result = await examService.start(token, exam.id);
          if (!ignore) {
            setAttemptId(result.attempt.id);
            setStartedAt(result.attempt.startedAt);
            if (result.attempt.lockedAt) {
              setLock(lockStatusFromAttempt(result.attempt));
              violationReported.current = true;
            } else {
              setQuestion(result.nextQuestion);
              if (!result.nextQuestion) await finish(result.attempt.id);
            }
          }
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 423 && active) {
          setLock(await examService.status(token, active.id));
          violationReported.current = true;
        } else {
          await showError(error, onUnauthorized);
          onCancel();
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!exam.durationMinutes || !startedAt) return;
    const update = () =>
      setSeconds(
        Math.max(
          0,
          Math.ceil(
            (new Date(startedAt).getTime() +
              exam.durationMinutes! * 60_000 -
              Date.now()) /
              1000,
          ),
        ),
      );
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [exam.durationMinutes, startedAt]);
  useEffect(() => {
    if (seconds === 0 && attemptId && !saving && !lock) void finish();
  }, [attemptId, finish, lock, saving, seconds]);

  const reportViolation = useCallback(
    (type: ExamViolationType, keepalive = false) => {
      if (!attemptId || violationReported.current) return;
      violationReported.current = true;
      const local: AttemptLockStatus = {
        id: attemptId,
        status: "IN_PROGRESS",
        lockedAt: new Date().toISOString(),
        lockReason: type,
        violationCount: 1,
        lastViolationAt: new Date().toISOString(),
      };
      setLock(local);
      setFeedback(null);
      setSaving(false);
      void examService
        .violation(token, attemptId, type, keepalive)
        .then(setLock)
        .catch((error) => {
          if (error instanceof ApiError && error.status === 401)
            onUnauthorized();
        });
    },
    [attemptId, onUnauthorized, token],
  );

  useEffect(() => {
    if (!attemptId || !question || lock) return;
    const visibility = () => {
      if (document.visibilityState === "hidden")
        reportViolation("TAB_HIDDEN", true);
    };
    const blur = () => reportViolation("WINDOW_BLUR", true);
    const restricted = (type: ExamViolationType) => (event: Event) => {
      event.preventDefault();
      reportViolation(type);
    };
    const copy = restricted("COPY");
    const paste = restricted("PASTE");
    const cut = restricted("CUT");
    const context = (event: Event) => event.preventDefault();
    const beforeUnload = (event: BeforeUnloadEvent) => {
      reportViolation("PAGE_EXIT", true);
      event.preventDefault();
      event.returnValue = "";
    };
    const pageHide = () => reportViolation("PAGE_EXIT", true);
    const shortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "c" || key === "v" || key === "x") {
        event.preventDefault();
        reportViolation(key === "c" ? "COPY" : key === "v" ? "PASTE" : "CUT");
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", blur);
    document.addEventListener("copy", copy);
    document.addEventListener("paste", paste);
    document.addEventListener("cut", cut);
    document.addEventListener("contextmenu", context);
    document.addEventListener("keydown", shortcut);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", pageHide);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", blur);
      document.removeEventListener("copy", copy);
      document.removeEventListener("paste", paste);
      document.removeEventListener("cut", cut);
      document.removeEventListener("contextmenu", context);
      document.removeEventListener("keydown", shortcut);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", pageHide);
    };
  }, [attemptId, lock, question, reportViolation]);

  const checkUnlock = useCallback(async () => {
    if (!attemptId || checkingUnlock.current) return;
    checkingUnlock.current = true;
    try {
      const status = await examService.status(token, attemptId);
      if (status.lockedAt) {
        setLock(status);
        return;
      }
      violationReported.current = false;
      setLock(null);
      setLoading(true);
      const next = await examService.next(token, attemptId);
      setQuestion(next);
      setAnswer("");
      setFeedback(null);
      if (!next) await finish(attemptId);
    } catch (error) {
      await showError(error, onUnauthorized);
    } finally {
      checkingUnlock.current = false;
      setLoading(false);
    }
  }, [attemptId, finish, onUnauthorized, token]);
  useEffect(() => {
    if (!lock) return;
    const timer = window.setInterval(() => void checkUnlock(), 5000);
    return () => window.clearInterval(timer);
  }, [checkUnlock, lock]);

  const sendAnswer = async () => {
    if (!question || !answer.trim() || lock || answerInFlight.current) return;
    answerInFlight.current = true;
    setSaving(true);
    try {
      setFeedback(
        await examService.answer(
          token,
          attemptId,
          question.id,
          responseFor(question, answer),
        ),
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 423)
        setLock(await examService.status(token, attemptId));
      else if (
        error instanceof ApiError &&
        (error.status === 400 || error.status === 409) &&
        /already been answered/i.test(error.message)
      ) {
        // The first request can reach the server even when its response is lost,
        // or a rapid double tap can race React's disabled-state render. Re-sync
        // from the attempt instead of leaving the student stuck on a stale item.
        try {
          const next = await examService.next(token, attemptId);
          if (next) {
            setQuestion(next);
            setAnswer("");
            setFeedback(null);
          } else {
            onComplete(await examService.submit(token, attemptId));
          }
        } catch (syncError) {
          await showError(syncError, onUnauthorized);
        }
      } else await showError(error, onUnauthorized);
    } finally {
      answerInFlight.current = false;
      setSaving(false);
    }
  };
  const continueNext = () => {
    if (!feedback) return;
    if (feedback.nextQuestion) {
      setQuestion(feedback.nextQuestion);
      setFeedback(null);
      setAnswer("");
    } else void finish();
  };
  const requestExit = async () => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ออกจากหน้าสอบไม่ได้",
      text: "หากยืนยัน ระบบจะล็อกข้อสอบและต้องให้ครูปลดล็อกก่อนจึงจะทำต่อได้",
      showCancelButton: true,
      confirmButtonText: "ยืนยันและล็อก",
      cancelButtonText: "ทำข้อสอบต่อ",
      confirmButtonColor: "#b94e3c",
    });
    if (result.isConfirmed) reportViolation("PAGE_EXIT");
  };
  const requestSubmit = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "ส่งข้อสอบตอนนี้?",
      text: "ข้อที่ยังไม่ได้ตอบจะไม่ได้คะแนน และไม่สามารถกลับมาแก้ไขได้",
      showCancelButton: true,
      confirmButtonText: "ส่งข้อสอบ",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) void finish();
  };

  if (lock)
    return (
      <LockedExamScreen
        exam={exam}
        lock={lock}
        seconds={seconds}
        checking={checkingUnlock.current}
        onCheck={() => void checkUnlock()}
      />
    );
  if (loading || !question)
    return (
      <main className="grid min-h-screen place-content-center justify-items-center gap-4 bg-[#f5f8f6]">
        <LoaderCircle className="animate-spin text-[#176b55]" size={36} />
        <p className="text-sm text-[#71847d]">กำลังเตรียมข้อสอบ...</p>
      </main>
    );
  const progress = Math.round(
    (question.progress.answered / question.progress.total) * 100,
  );
  return (
    <main className="min-h-screen bg-[#f5f8f6] text-[#18322d] select-none">
      <header className="sticky top-0 z-20 border-b border-[#dce7e2] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-17 max-w-5xl items-center gap-3 px-4 sm:px-6">
          <button
            className="grid size-9 shrink-0 place-items-center rounded-lg text-[#62766f] hover:bg-[#edf2ef]"
            onClick={requestExit}
            aria-label="ออกจากหน้าทำข้อสอบ"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold">{exam.title}</h1>
            <p className="truncate text-[10px] text-[#879890]">
              {exam.subject.name} · {exam.classroom.name}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {question.type === "ESSAY" && (
              <span className="hidden sm:inline-flex">
                <AiStatusBadge status={aiStatus} compact />
              </span>
            )}
            <span
              className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold ${seconds !== null && seconds < 300 ? "bg-[#fee8e3] text-[#b94e3c]" : "bg-[#dff1ea] text-[#176b55]"}`}
            >
              <Clock3 size={15} />
              {formatTime(seconds)}
            </span>
            <button
              className="student-button-secondary hidden sm:inline-flex"
              onClick={requestSubmit}
            >
              <Send size={14} />
              ส่งข้อสอบ
            </button>
          </div>
        </div>
        <div className="h-1 bg-[#e8efeb]">
          <div
            className="h-full bg-[#238568] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-4 flex items-center justify-between text-[11px] font-semibold text-[#71847d]">
          <span>
            ข้อ {question.progress.answered + 1} จาก {question.progress.total}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldAlert size={13} />
            เปิดระบบควบคุมการสอบแล้ว
          </span>
        </div>
        <article className="rounded-lg border border-[#dce7e2] bg-white p-5 shadow-[0_10px_35px_rgba(24,50,45,.05)] sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#e8efeb] px-2.5 py-1 text-[10px] font-bold text-[#526a62]">
              ข้อที่ {question.progress.answered + 1}
            </span>
            <span className="rounded-md bg-[#fff0c8] px-2.5 py-1 text-[10px] font-bold text-[#805e10]">
              {difficulty[question.difficulty] || question.difficulty}
            </span>
            {exam.isAdaptive && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#e4effa] px-2.5 py-1 text-[10px] font-bold text-[#315f86]">
                <Activity size={12} />
                ปรับระดับอัตโนมัติ
              </span>
            )}
            <span className="ml-auto text-[10px] text-[#879890]">
              {Number(question.score)} คะแนน
            </span>
          </div>
          <h2 className="mt-6 whitespace-pre-wrap text-lg font-bold leading-8 sm:text-xl">
            {question.prompt}
          </h2>
          {question.imageUrl && (
            <QuestionImage url={question.imageUrl} prompt={question.prompt} />
          )}
          <QuestionInput
            question={question}
            value={answer}
            onChange={setAnswer}
            disabled={Boolean(feedback) || saving}
          />
          {feedback && (
            <div
              className={`mt-6 rounded-lg border p-5 ${feedback.answer.isCorrect ? "border-[#b9dfd0] bg-[#eff8f4]" : "border-[#f0d493] bg-[#fff9e9]"}`}
            >
              <div className="flex items-center gap-2">
                {feedback.answer.isCorrect ? (
                  <CheckCircle2 className="text-[#238568]" />
                ) : (
                  <XCircle className="text-[#c56c19]" />
                )}
                <b
                  className={
                    feedback.answer.isCorrect
                      ? "text-[#176b55]"
                      : "text-[#9a651a]"
                  }
                >
                  {feedback.answer.isCorrect
                    ? "ถูกต้อง ทำได้ดีมาก"
                    : "คำตอบนี้ยังไม่ถูก"}
                </b>
              </div>
              {feedback.answer.feedback && (
                <p className="mt-3 text-xs leading-6 text-[#526a62]">
                  {question.type === "ESSAY" && (
                    <Sparkles
                      className="mr-2 inline text-[#315f86]"
                      size={15}
                    />
                  )}
                  {feedback.answer.feedback}
                </p>
              )}
            </div>
          )}
          <footer className="mt-7 flex justify-end">
            <button
              className="student-button-primary min-w-36"
              onClick={feedback ? continueNext : sendAnswer}
              disabled={saving || (!feedback && !answer.trim())}
            >
              {saving ? (
                "กำลังบันทึก..."
              ) : feedback ? (
                <>
                  {feedback.nextQuestion ? "ข้อต่อไป" : "ดูผลสอบ"}
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  ส่งคำตอบ
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </footer>
        </article>
        <ExamCompanions />
        <button
          className="student-button-secondary mt-5 w-full sm:hidden"
          onClick={requestSubmit}
        >
          <Send size={14} />
          ส่งข้อสอบก่อนครบทุกข้อ
        </button>
      </div>
    </main>
  );
}

function LockedExamScreen({
  exam,
  lock,
  seconds,
  checking,
  onCheck,
}: {
  exam: StudentExam;
  lock: AttemptLockStatus;
  seconds: number | null;
  checking: boolean;
  onCheck: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f5f3] p-5 text-[#3b2926]">
      <section className="w-full max-w-lg rounded-lg border border-[#efc0b8] bg-white p-7 text-center shadow-[0_18px_50px_rgba(112,48,38,.12)] sm:p-9">
        <span className="mx-auto grid size-14 place-items-center rounded-lg bg-[#fff1ee] text-[#b94e3c]">
          <LockKeyhole size={28} />
        </span>
        <span className="mt-5 block text-xs font-bold text-[#b94e3c]">
          ข้อสอบถูกล็อก
        </span>
        <h1 className="mt-2 text-xl font-bold sm:text-2xl">
          ไม่สามารถทำข้อสอบต่อได้
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#725e59]">
          ระบบตรวจพบการ
          {violationLabels[lock.lockReason || ""] || "ออกจากหน้าทำข้อสอบ"}{" "}
          กรุณาแจ้งครูผู้คุมสอบเพื่อปลดล็อก
        </p>
        <div className="mt-6 grid grid-cols-2 divide-x divide-[#eadedb] rounded-lg bg-[#faf6f5] p-4">
          <div>
            <span className="block text-[10px] text-[#967f79]">ชุดข้อสอบ</span>
            <b className="mt-1 block truncate text-xs">{exam.title}</b>
          </div>
          <div>
            <span className="block text-[10px] text-[#967f79]">
              เวลาคงเหลือ
            </span>
            <b className="mt-1 block text-xs text-[#b94e3c]">
              {formatTime(seconds)}
            </b>
          </div>
        </div>
        <p className="mt-5 text-[11px] leading-5 text-[#967f79]">
          หน้านี้จะตรวจสอบสถานะอัตโนมัติทุก 5 วินาที
          และกลับเข้าสู่ข้อสอบทันทีเมื่อครูปลดล็อก
        </p>
        <button
          className="student-button-secondary mt-5 w-full"
          onClick={onCheck}
          disabled={checking}
        >
          <RefreshCw size={15} className={checking ? "animate-spin" : ""} />
          ตรวจสอบอีกครั้ง
        </button>
      </section>
    </main>
  );
}

function lockStatusFromAttempt(attempt: {
  id: string;
  lockedAt?: string | null;
  lockReason?: string | null;
  violationCount?: number;
  lastViolationAt?: string | null;
}): AttemptLockStatus {
  return {
    id: attempt.id,
    status: "IN_PROGRESS",
    lockedAt: attempt.lockedAt || new Date().toISOString(),
    lockReason: attempt.lockReason || "PAGE_EXIT",
    violationCount: attempt.violationCount || 1,
    lastViolationAt:
      attempt.lastViolationAt || attempt.lockedAt || new Date().toISOString(),
  };
}
function formatTime(seconds: number | null) {
  return seconds === null
    ? "ไม่จำกัด"
    : `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
async function showError(error: unknown, onUnauthorized: () => void) {
  const status =
    typeof error === "object" && error && "status" in error
      ? Number(error.status)
      : 0;
  await Swal.fire({
    icon: "error",
    title: "ไม่สำเร็จ",
    text: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
  });
  if (status === 401) onUnauthorized();
}
