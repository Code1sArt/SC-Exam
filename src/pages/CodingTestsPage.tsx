import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  FileText,
  LoaderCircle,
  LockKeyhole,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Send,
  Terminal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { EmptyState } from "../components/ui/StateViews";
import { codingTestService } from "../services/coding-test.service";
import type { CodeRunResult } from "../types/assignment";
import type {
  CodingAttempt,
  CodingProblem,
  StudentCodingTest,
} from "../types/coding-test";

const labels = {
  C: "C",
  CPP: "C++",
  CSHARP: "C#",
  PYTHON: "Python",
} as const;

const starter = {
  C: "#include <stdio.h>\n\nint main(void) {\n    return 0;\n}\n",
  CPP: "#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n",
  CSHARP:
    "using System;\n\nclass Program {\n    static void Main() {\n    }\n}\n",
  PYTHON:
    'def main():\n    pass\n\nif __name__ == "__main__":\n    main()\n',
};

export function CodingTestsPage({
  token,
  rows,
  onRefresh,
  onRecords,
}: {
  token: string;
  rows: StudentCodingTest[];
  onRefresh: () => Promise<void>;
  onRecords: () => Promise<void>;
}) {
  const [test, setTest] = useState<StudentCodingTest | null>(null);
  const [attempt, setAttempt] = useState<CodingAttempt | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeId, setActiveId] = useState("");
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [stdin, setStdin] = useState("");
  const [run, setRun] = useState<CodeRunResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [problemOpen, setProblemOpen] = useState(true);
  const [problemExpanded, setProblemExpanded] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const active =
    problems.find((problem) => problem.id === activeId) ?? null;

  const begin = async (row: StudentCodingTest) => {
    if (!row.attempts[0]) {
      const confirm = await Swal.fire({
        icon: "question",
        title: row.title,
        html: `<p>เลือกทำ ${row.requiredCount} จาก ${row.problems.length} ข้อ</p>`,
        showCancelButton: true,
        confirmButtonText: "เริ่มสอบ",
        cancelButtonText: "ยกเลิก",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      const result = await codingTestService.start(token, row.id);
      const currentAttempt =
        result.attempt.status === "IN_PROGRESS"
          ? result.attempt
          : await codingTestService.status(token, result.attempt.id);
      setTest(row);
      setAttempt(currentAttempt);
      setProblems(result.problems);
      setSelected(
        currentAttempt.answers?.map((answer) => answer.problemId) ?? [],
      );
      setActiveId(result.problems[0]?.id ?? "");
      setCodes(
        Object.fromEntries(
          result.problems.map((problem) => [
            problem.id,
            currentAttempt.answers?.find(
              (answer) => answer.problemId === problem.id,
            )?.sourceCode ?? starter[problem.language],
          ]),
        ),
      );
      setStdin("");
      setRun(null);
      setProblemOpen(true);
      setProblemExpanded(false);
    } catch (error) {
      await fail(error);
    }
  };

  useEffect(() => {
    if (
      !attempt ||
      !["QUEUED", "GRADING"].includes(attempt.gradingStatus ?? "")
    )
      return;
    const timer = window.setInterval(
      () =>
        void codingTestService
          .status(token, attempt.id)
          .then(async (status) => {
            setAttempt(status);
            if (status.status === "GRADED") {
              clearInterval(timer);
              await onRefresh();
              await onRecords();
            }
          }),
      3000,
    );
    return () => clearInterval(timer);
  }, [attempt, onRecords, onRefresh, token]);

  useEffect(() => {
    if (
      !test?.durationMinutes ||
      !attempt?.startedAt ||
      attempt.status !== "IN_PROGRESS"
    ) {
      setRemainingSeconds(null);
      return;
    }

    const update = () => {
      const endAt =
        new Date(attempt.startedAt).getTime() + test.durationMinutes! * 60_000;
      setRemainingSeconds(
        Number.isFinite(endAt)
          ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
          : null,
      );
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [attempt?.startedAt, attempt?.status, test?.durationMinutes]);

  const choose = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < (test?.requiredCount ?? 0)
          ? [...current, id]
          : current,
    );

  const openProblem = (id: string) => {
    setActiveId(id);
    setRun(null);
    setProblemOpen(true);
    setProblemExpanded(false);
  };

  const execute = async () => {
    if (!test || !active || !codes[active.id]?.trim()) return;
    setBusy(true);
    try {
      setRun(
        await codingTestService.run(
          token,
          test.id,
          active.id,
          codes[active.id],
          stdin,
        ),
      );
      setConsoleOpen(true);
    } catch (error) {
      await fail(error);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (
      !attempt ||
      !test ||
      selected.length !== test.requiredCount ||
      selected.some((id) => !codes[id]?.trim())
    )
      return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "ยืนยันส่ง Coding Test?",
      text: "ส่งแล้วจะกลับมาแก้ไขไม่ได้",
      showCancelButton: true,
      confirmButtonText: "ส่งเข้าคิวตรวจ",
      cancelButtonText: "ตรวจทานต่อ",
    });
    if (!confirm.isConfirmed) return;
    setBusy(true);
    try {
      const status = await codingTestService.submit(
        token,
        attempt.id,
        selected.map((problemId) => ({
          problemId,
          sourceCode: codes[problemId],
        })),
      );
      setAttempt(status);
      await onRefresh();
      await Swal.fire({
        icon: "success",
        title:
          status.gradingStatus === "QUEUED"
            ? "ส่งเข้าคิวตรวจแล้ว"
            : "ส่งข้อสอบแล้ว",
        text:
          status.gradingStatus === "QUEUED"
            ? "ระบบกำลังจัดคิวตรวจและให้คะแนน คุณออกจากหน้านี้ได้"
            : "รอครูตรวจและให้คะแนน",
      });
    } catch (error) {
      await fail(error);
    } finally {
      setBusy(false);
    }
  };

  if (test && attempt) {
    if (attempt.lockedAt) {
      return (
        <section className="-mx-4 -mt-7 grid min-h-[70vh] place-items-center bg-[#111a20] p-6 text-center text-white sm:-mx-6 sm:-mt-9">
          <div>
            <LockKeyhole className="mx-auto text-[#ef7463]" size={52} />
            <h2 className="mt-5 text-2xl font-bold">Coding Test ถูกล็อก</h2>
            <p className="mt-2 text-sm text-white/60">
              ตรวจพบ {attempt.lockReason} กรุณาแจ้งครูเพื่อปลดล็อก
              ระบบจะตรวจสถานะอัตโนมัติ
            </p>
          </div>
        </section>
      );
    }

    if (attempt.status !== "IN_PROGRESS") {
      const graded = attempt.status === "GRADED";
      return (
        <section className="-mx-4 -mt-7 min-h-[70vh] bg-[#111a20] p-4 text-white sm:-mx-6 sm:-mt-9 sm:p-6">
          <div className="mx-auto max-w-5xl">
            <button
              className="rounded-lg bg-white/10 px-4 py-2 text-xs transition hover:bg-white/15"
              onClick={() => setTest(null)}
            >
              กลับหน้ารายการ
            </button>

            <div className="py-8 text-center">
              {graded ? (
                <CheckCircle2 className="mx-auto text-[#68d3ad]" size={52} />
              ) : (
                <LoaderCircle
                  className="mx-auto animate-spin text-[#f4c95d]"
                  size={52}
                />
              )}
              <h2 className="mt-5 text-2xl font-bold">
                {graded
                  ? `ได้ ${Number(attempt.score)}/${Number(attempt.maxScore)} คะแนน`
                  : attempt.gradingStatus === "GRADING"
                    ? "กำลังตรวจโค้ด"
                    : attempt.gradingStatus === "FAILED"
                      ? "คิวตรวจมีปัญหา ครูจะตรวจสอบให้"
                      : "อยู่ในคิวตรวจ"}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {graded
                  ? "คะแนนอิงจากผล Test case รวมถึงโครงสร้างและอัลกอริทึมของแต่ละข้อ"
                  : "ออกจากหน้านี้ได้ ระบบจะประมวลผลต่ออัตโนมัติ"}
              </p>
            </div>

            {graded && (
              <div className="space-y-5 text-left">
                {attempt.answers?.map((answer, index) => {
                  const problem = problems.find(
                    (item) => item.id === answer.problemId,
                  );
                  return (
                    <article
                      className="overflow-hidden rounded-xl border border-white/10 bg-[#162129]"
                      key={answer.id}
                    >
                      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                        <span className="grid size-8 place-items-center rounded-lg bg-[#68d3ad]/15 text-xs font-bold text-[#82dfbd]">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold">
                            {answer.problem?.title ?? problem?.title ?? `ข้อ ${index + 1}`}
                          </h3>
                          <span className="text-[10px] text-white/45">
                            {problem ? labels[problem.language] : "Source code"}
                            {answer.totalTestCases != null &&
                              ` · ผ่าน ${answer.passedTestCases ?? 0}/${answer.totalTestCases} Test case`}
                          </span>
                        </div>
                        <b className="ml-auto text-sm text-[#82dfbd]">
                          {Number(answer.score ?? 0)}/
                          {Number(answer.problem?.score ?? problem?.score ?? 0)} คะแนน
                        </b>
                      </header>

                      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] sm:p-5">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-white/55">
                            <Code2 size={14} className="text-[#68d3ad]" />
                            โค้ดที่ส่ง
                          </div>
                          <pre className="max-h-[420px] overflow-auto whitespace-pre rounded-lg border border-white/10 bg-[#0d151a] p-4 font-mono text-xs leading-5 text-[#d7e4df]">
                            {answer.sourceCode || "ไม่มีข้อมูลโค้ดที่ส่ง"}
                          </pre>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-white/55">
                            <FileText size={14} className="text-[#f4c95d]" />
                            ที่มาของคะแนน
                          </div>
                          <div className="min-h-32 whitespace-pre-line rounded-lg border border-white/10 bg-white/[0.035] p-4 text-xs leading-6 text-white/70">
                            {answer.feedback ||
                              "ยังไม่มีรายละเอียดการให้คะแนนสำหรับข้อนี้"}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <section className="-mx-4 -mt-7 min-h-[calc(100vh-64px)] overflow-hidden bg-[#111a20] text-white sm:-mx-6 sm:-mt-9">
        <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-white/10 bg-[#162129] px-3 py-2.5 sm:px-4">
          <button
            className="grid size-9 shrink-0 place-items-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={() => setTest(null)}
            title="ออกจากข้อสอบ"
          >
            <X size={20} />
          </button>
          <div className="min-w-0">
            <b className="block truncate text-sm">{test.title}</b>
            <span className="block text-[10px] text-white/45">
              เลือกแล้ว {selected.length}/{test.requiredCount} ข้อ
            </span>
          </div>
          <div
            className={`ml-auto flex h-10 items-center gap-2 rounded-lg border px-3 font-mono text-sm font-bold tabular-nums ${timerTone(remainingSeconds)}`}
            title="เวลาที่เหลือ"
          >
            <Clock3 size={17} />
            {remainingSeconds === null
              ? "ไม่จำกัดเวลา"
              : formatDuration(remainingSeconds)}
          </div>
          <button
            className="flex h-10 items-center gap-2 rounded-lg bg-[#238568] px-3 text-xs font-bold transition hover:bg-[#2a9b7a] disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
            disabled={
              busy ||
              selected.length !== test.requiredCount
            }
            onClick={() => void submit()}
          >
            <Send size={15} />
            ส่งข้อสอบ
          </button>
        </header>

        <nav className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#121c23] px-3 py-2.5 sm:px-4">
          {problems.map((problem, index) => {
            const checked = selected.includes(problem.id);
            const isActive = activeId === problem.id;
            return (
              <div
                className={`flex shrink-0 items-center overflow-hidden rounded-lg border transition ${
                  isActive
                    ? "border-[#68d3ad] bg-[#203b36]"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                }`}
                key={problem.id}
              >
                <button
                  className="flex items-center gap-2 py-2 pl-3 pr-2 text-left"
                  onClick={() => openProblem(problem.id)}
                >
                  <span
                    className={`grid size-5 place-items-center rounded text-[10px] font-bold ${
                      isActive
                        ? "bg-[#68d3ad] text-[#10251f]"
                        : "bg-white/10 text-white/55"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>
                    <b className="block max-w-36 truncate text-[11px]">
                      {problem.title}
                    </b>
                    <small className="block text-[9px] font-normal text-white/40">
                      {labels[problem.language]} · {Number(problem.score)} คะแนน
                    </small>
                  </span>
                </button>
                <button
                  className={`mr-1 grid size-8 place-items-center rounded-md border ${
                    checked
                      ? "border-[#68d3ad]/60 bg-[#68d3ad] text-[#10251f]"
                      : "border-white/15 text-white/35 hover:border-white/35"
                  }`}
                  onClick={() => choose(problem.id)}
                  aria-label={
                    checked
                      ? `ยกเลิกเลือก ${problem.title}`
                      : `เลือก ${problem.title}`
                  }
                  title={checked ? "ยกเลิกเลือกข้อนี้" : "เลือกข้อนี้เพื่อส่ง"}
                >
                  {checked && <Check size={15} strokeWidth={3} />}
                </button>
              </div>
            );
          })}
        </nav>

        {active && (
          <div
            className={`grid min-h-[calc(100vh-191px)] ${
              problemExpanded
                ? "grid-cols-1"
                : problemOpen
                ? "grid-rows-[minmax(280px,38vh)_minmax(520px,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,36%)] lg:grid-rows-1"
                : "grid-cols-1"
            }`}
          >
            {!problemExpanded && <main className="min-w-0 overflow-hidden bg-[#111a20] lg:order-first">
              <div className="flex h-11 items-center gap-2 border-b border-white/10 bg-[#162129] px-3 text-[10px] text-white/55 sm:px-4">
                <Code2 size={15} className="text-[#68d3ad]" />
                <b className="text-white/80">{labels[active.language]}</b>
                <span className="hidden text-white/25 sm:inline">•</span>
                <span className="hidden truncate sm:inline">{active.title}</span>
                <button
                  className="ml-auto flex items-center gap-1.5 rounded-md bg-white/8 px-2.5 py-1.5 font-bold text-white transition hover:bg-white/15 disabled:opacity-40"
                  onClick={() => void execute()}
                  disabled={busy}
                >
                  <Play size={13} />
                  ทดลองรัน
                </button>
                <button
                  className="flex items-center gap-1.5 rounded-md bg-white/8 px-2.5 py-1.5 font-bold text-white transition hover:bg-white/15"
                  onClick={() => setProblemOpen((open) => !open)}
                  title={problemOpen ? "ซ่อนโจทย์" : "แสดงโจทย์"}
                >
                  {problemOpen ? (
                    <PanelRightClose size={14} />
                  ) : (
                    <PanelRightOpen size={14} />
                  )}
                  {problemOpen ? "ขยาย Editor" : "แสดงโจทย์"}
                </button>
              </div>
              <CodeMirror
                value={codes[active.id]}
                height={consoleOpen ? "calc(100vh - 410px)" : "calc(100vh - 235px)"}
                minHeight="420px"
                theme={vscodeDark}
                extensions={[active.language === "PYTHON" ? python() : cpp()]}
                onChange={(value) =>
                  setCodes((current) => ({
                    ...current,
                    [active.id]: value,
                  }))
                }
              />
              <section className="border-t border-white/10 bg-[#0d151a]">
                <button
                  className="flex h-9 w-full items-center gap-2 px-3 text-left text-[10px] font-bold text-white/55 hover:bg-white/[0.03] sm:px-4"
                  onClick={() => setConsoleOpen((open) => !open)}
                >
                  <Terminal size={13} />
                  Console
                  {run && (
                    <span className="rounded bg-[#68d3ad]/15 px-1.5 py-0.5 text-[9px] text-[#82dfbd]">
                      มีผลลัพธ์
                    </span>
                  )}
                  {consoleOpen ? (
                    <ChevronDown className="ml-auto" size={14} />
                  ) : (
                    <ChevronUp className="ml-auto" size={14} />
                  )}
                </button>
                {consoleOpen && (
                  <div className="grid gap-3 border-t border-white/5 p-3 md:grid-cols-[minmax(240px,40%)_minmax(0,1fr)] md:p-4">
                    <div>
                      <label className="text-[10px] font-semibold text-white/45">
                        ข้อมูลนำเข้า (stdin)
                      </label>
                      <textarea
                        className="mt-1.5 h-32 min-h-24 w-full resize-y rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 outline-none transition focus:border-[#68d3ad]/60 focus:ring-1 focus:ring-[#68d3ad]/20"
                        value={stdin}
                        onChange={(event) => setStdin(event.target.value)}
                        placeholder="กรอกข้อมูลสำหรับทดลองรัน"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-white/45">
                        ผลลัพธ์
                      </label>
                      <pre className="mt-1.5 h-32 overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 text-[#a7e8d0]">
                        {run
                          ? run.stdout ||
                            run.stderr ||
                            run.compileOutput ||
                            run.status
                          : "ผลการรันจะแสดงที่นี่"}
                      </pre>
                    </div>
                  </div>
                )}
              </section>
            </main>}

            {problemOpen && (
              <aside className="order-first min-w-0 overflow-hidden border-b border-white/10 bg-white lg:order-last lg:border-b-0 lg:border-l">
                <div className="flex h-11 items-center gap-2 border-b border-[#dce7e2] px-3 text-xs font-bold text-[#18322d] sm:px-4">
                  <FileText size={15} className="text-[#238568]" />
                  <span className="truncate">{active.title}</span>
                  <button
                    className="ml-auto grid size-7 place-items-center rounded-md text-[#176b55] hover:bg-[#e8f4ef]"
                    onClick={() => setProblemExpanded((expanded) => !expanded)}
                    title={problemExpanded ? "กลับสู่หน้าเขียนโค้ด" : "ขยายโจทย์"}
                  >
                    {problemExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                  {!problemExpanded && <button
                    className="grid size-7 place-items-center rounded-md text-[#62766f] hover:bg-[#edf2f0] lg:hidden"
                    onClick={() => setProblemOpen(false)}
                    title="ซ่อนโจทย์"
                  >
                    <X size={15} />
                  </button>}
                </div>
                <iframe
                  className={
                    problemExpanded
                      ? "h-[calc(100vh-235px)] min-h-[620px] w-full"
                      : "h-[calc(38vh-44px)] min-h-60 w-full lg:h-[calc(100vh-235px)] lg:min-h-[620px]"
                  }
                  src={active.previewUrl}
                  title={active.title}
                />
              </aside>
            )}
          </div>
        )}
      </section>
    );
  }

  return rows.length ? (
    <div className="grid gap-4 lg:grid-cols-2">
      {rows.map((row) => {
        const item = row.attempts[0];
        return (
          <article
            className="rounded-xl border border-[#dce7e2] bg-white p-5"
            key={row.id}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-[#e8efff] text-[#315f86]">
                <Code2 />
              </span>
              <div>
                <span className="text-[10px] font-bold text-[#238568]">
                  {row.subject.name} · {row.classroom.name}
                </span>
                <h2 className="mt-1 font-bold">{row.title}</h2>
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-[#62766f]">
              {row.description}
            </p>
            <div className="mt-4 flex gap-3 border-t pt-4 text-[10px] text-[#71847d]">
              <span className="flex items-center gap-1">
                <FileText size={14} /> เลือก {row.requiredCount}/
                {row.problems.length} ข้อ
              </span>
              {row.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock3 size={14} /> {row.durationMinutes} นาที
                </span>
              )}
              <b className="ml-auto text-[#18322d]">
                {item?.status === "GRADED"
                  ? `${Number(item.score)}/${Number(item.maxScore)} คะแนน`
                  : item?.gradingStatus === "QUEUED" ||
                      item?.gradingStatus === "GRADING"
                    ? "อยู่ในคิวตรวจ"
                    : item?.lockedAt
                      ? "ถูกล็อก"
                      : "พร้อมสอบ"}
              </b>
            </div>
            <button
              className="mt-4 w-full rounded-lg bg-[#176b55] py-2.5 text-xs font-bold text-white"
              onClick={() => void begin(row)}
            >
              {item?.status === "GRADED"
                ? "ดูผล"
                : item?.status === "SUBMITTED"
                  ? "ดูสถานะคิว"
                  : item
                    ? "ทำต่อ"
                    : "เริ่ม Coding Test"}
            </button>
          </article>
        );
      })}
    </div>
  ) : (
    <EmptyState
      title="ยังไม่มี Coding Test"
      text="เมื่อครูเปิดชุดสอบ จะปรากฏที่หน้านี้"
    />
  );
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function timerTone(seconds: number | null) {
  if (seconds === null)
    return "border-white/10 bg-white/5 text-white/60";
  if (seconds <= 300)
    return "border-[#ef7463]/40 bg-[#ef7463]/15 text-[#ff9d90]";
  if (seconds <= 900)
    return "border-[#f4c95d]/35 bg-[#f4c95d]/10 text-[#f4c95d]";
  return "border-[#68d3ad]/30 bg-[#68d3ad]/10 text-[#82dfbd]";
}

async function fail(error: unknown) {
  await Swal.fire({
    icon: "error",
    title: "ดำเนินการไม่สำเร็จ",
    text: error instanceof Error ? error.message : "กรุณาลองใหม่",
  });
}
