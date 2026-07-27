import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { csharp } from "@replit/codemirror-lang-csharp";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import CodeMirror from "@uiw/react-codemirror";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  Lightbulb,
  LoaderCircle,
  Play,
  RotateCcw,
  Terminal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { StudentAiStatus } from "../services/ai.service";
import type {
  PlaygroundAdvice,
  PlaygroundLanguage,
  PlaygroundRunResult,
} from "../types/playground";

const languageOptions: Array<{
  value: PlaygroundLanguage;
  label: string;
  file: string;
}> = [
  { value: "CPP", label: "C++", file: "main.cpp" },
  { value: "CSHARP", label: "C#", file: "Program.cs" },
  { value: "PYTHON", label: "Python", file: "main.py" },
];

const starters: Record<PlaygroundLanguage, string> = {
  CPP: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Lab EDU!" << endl;
    return 0;
}`,
  CSHARP: `using System;
using System.Text;

class Program
{
    static void Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        Console.WriteLine("Hello, Lab EDU!");
    }
}`,
  PYTHON: `print("Hello, Lab EDU!")`,
};

const storageKey = (language: PlaygroundLanguage) =>
  `lab_edu_playground_${language.toLowerCase()}`;

export function PlaygroundPage({
  aiStatus,
  onRun,
  onAdvice,
}: {
  aiStatus: StudentAiStatus | null;
  onRun: (
    language: PlaygroundLanguage,
    sourceCode: string,
    stdin: string,
  ) => Promise<PlaygroundRunResult>;
  onAdvice: (
    language: PlaygroundLanguage,
    sourceCode: string,
  ) => Promise<PlaygroundAdvice>;
}) {
  const [language, setLanguage] = useState<PlaygroundLanguage>("PYTHON");
  const [code, setCode] = useState(
    () => localStorage.getItem(storageKey("PYTHON")) ?? starters.PYTHON,
  );
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState<PlaygroundRunResult | null>(null);
  const [advice, setAdvice] = useState<PlaygroundAdvice | null>(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [runPhase, setRunPhase] = useState<
    "idle" | "queued" | "running" | "success" | "compile-error" | "timeout"
  >("idle");
  const [asking, setAsking] = useState(false);
  const activeLanguage = languageOptions.find((item) => item.value === language)!;
  const aiAvailable = Boolean(aiStatus?.feedback);
  const extensions = useMemo(
    () =>
      language === "CPP"
        ? [cpp()]
        : language === "CSHARP"
          ? [csharp()]
          : [python()],
    [language],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => localStorage.setItem(storageKey(language), code),
      250,
    );
    return () => window.clearTimeout(timer);
  }, [code, language]);

  const chooseLanguage = (next: PlaygroundLanguage) => {
    setLanguage(next);
    setCode(localStorage.getItem(storageKey(next)) ?? starters[next]);
    setResult(null);
    setAdvice(null);
    setError("");
    setRunPhase("idle");
  };

  const run = async () => {
    if (!code.trim() || running) return;
    setRunning(true);
    setRunPhase("queued");
    setResult(null);
    setError("");
    const runningTimer = window.setTimeout(() => setRunPhase("running"), 350);
    try {
      const nextResult = await onRun(language, code, stdin);
      setResult(nextResult);
      setRunPhase(
        nextResult.statusId === 3
          ? "success"
          : nextResult.statusId === 6
            ? "compile-error"
            : nextResult.statusId === 5
              ? "timeout"
              : "idle",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "รันโค้ดไม่สำเร็จ");
      setRunPhase("idle");
    } finally {
      window.clearTimeout(runningTimer);
      setRunning(false);
    }
  };

  const askAdvice = async () => {
    if (!code.trim() || !aiAvailable || asking) return;
    setAsking(true);
    setAdvice(null);
    setError("");
    setRunPhase("idle");
    try {
      setAdvice(await onAdvice(language, code));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "ขอคำแนะนำจาก AI ไม่สำเร็จ",
      );
    } finally {
      setAsking(false);
    }
  };

  const reset = () => {
    setCode(starters[language]);
    setStdin("");
    setResult(null);
    setAdvice(null);
    setError("");
  };

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-xl border border-[#26394a] bg-[#111827] shadow-[0_16px_45px_rgba(24,50,45,.12)]">
        <header className="flex flex-wrap items-center gap-3 border-b border-[#2e3b4e] bg-[#172033] px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-bold text-white">
            <Code2 size={17} className="text-[#77d7b3]" />
            {activeLanguage.file}
          </span>
          <div className="order-3 flex w-full rounded-lg bg-[#0d1422] p-1 sm:order-none sm:ml-3 sm:w-auto">
            {languageOptions.map((item) => (
              <button
                key={item.value}
                className={`h-8 flex-1 rounded-md px-4 text-[11px] font-bold transition sm:flex-none ${
                  language === item.value
                    ? "bg-[#238568] text-white"
                    : "text-[#9eacbd] hover:text-white"
                }`}
                onClick={() => chooseLanguage(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-[#3c4a5f] px-3 text-[10px] font-bold text-[#cbd5e1] hover:bg-white/5"
            onClick={reset}
          >
            <RotateCcw size={13} /> เริ่มใหม่
          </button>
        </header>
        <CodeMirror
          value={code}
          height="430px"
          theme={vscodeDark}
          extensions={extensions}
          onChange={setCode}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            autocompletion: true,
            bracketMatching: true,
          }}
          aria-label={`ตัวแก้ไขโค้ด ${activeLanguage.label}`}
        />
        <footer className="flex flex-wrap items-center gap-2 border-t border-[#2e3b4e] bg-[#172033] p-3">
          <span className="mr-auto hidden text-[10px] text-[#8290a2] sm:block">
            โค้ดจะถูกบันทึกไว้ในอุปกรณ์นี้อัตโนมัติ
          </span>
          {aiAvailable && (
            <button
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#45536a] px-4 text-xs font-bold text-white transition hover:bg-white/5 disabled:cursor-not-allowed"
              disabled={!code.trim() || asking}
              onClick={() => void askAdvice()}
              title="ขอคำแนะนำจากโค้ดปัจจุบัน"
            >
              {asking ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Bot size={16} className="text-[#a9d8ff]" />
              )}
              {asking ? "กำลังวิเคราะห์..." : "ขอคำแนะนำ AI"}
            </button>
          )}
          <button
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#2aa37f] px-5 text-xs font-bold text-white transition hover:bg-[#238568] disabled:cursor-not-allowed"
            disabled={!code.trim() || running}
            onClick={() => void run()}
          >
            {running ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Play size={15} fill="currentColor" />
            )}
            {running
              ? runPhase === "queued"
                ? "รอคิว..."
                : "กำลังรัน..."
              : "Run code"}
          </button>
        </footer>
      </section>

      <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section className="overflow-hidden rounded-xl border border-[#dce7e2] bg-white">
          <header className="flex items-center gap-2 border-b border-[#edf2ef] px-4 py-3">
            <Terminal size={16} className="text-[#176b55]" />
            <b className="text-xs">ข้อมูลนำเข้า (stdin)</b>
          </header>
          <textarea
            className="min-h-36 w-full resize-y bg-white p-4 font-mono text-xs leading-6 outline-none placeholder:text-[#9aa9a3]"
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            placeholder="ใส่ข้อมูลที่โปรแกรมต้องอ่าน (ถ้ามี)"
          />
        </section>
        <section className="overflow-hidden rounded-xl border border-[#26394a] bg-[#111827] text-white">
          <header className="flex items-center gap-2 border-b border-[#2e3b4e] px-4 py-3">
            <Terminal size={16} className="text-[#77d7b3]" />
            <b className="text-xs">Console</b>
            {running && !result && !error && (
              <span className="ml-auto text-[10px] font-bold text-[#ffbd66]">
                {runPhase === "queued" ? "รอคิว" : "กำลังรัน"}
              </span>
            )}
            {result && (
              <span
                className={`ml-auto inline-flex items-center gap-1 text-[10px] font-bold ${
                  result.statusId === 3 ? "text-[#77d7b3]" : "text-[#ff9c9c]"
                }`}
              >
                {result.statusId === 3 && <CheckCircle2 size={13} />}
                {result.status}
                {result.time !== null && (
                  <>
                    <Clock3 size={12} className="ml-1" />
                    {result.time.toFixed(3)}s
                  </>
                )}
              </span>
            )}
          </header>
          <pre
            className={`min-h-36 max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-xs leading-6 ${
              error || (result && result.statusId !== 3)
                ? "text-[#ff9c9c]"
                : "text-[#d4d4d4]"
            }`}
          >
            {error || (result ? formatOutput(result) : "ผลลัพธ์จะแสดงที่นี่")}
          </pre>
        </section>
      </div>

      {advice && (
        <section className="rounded-xl border border-[#cfe3da] bg-white p-5 shadow-[0_8px_28px_rgba(24,50,45,.05)] sm:p-6">
          <header className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#e2f3ec] text-[#176b55]">
              <Lightbulb size={20} />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#238568]">
                AI Code Coach
              </span>
              <h2 className="mt-1 text-base font-bold">คำแนะนำสำหรับโค้ดนี้</h2>
              <p className="mt-1 text-xs leading-6 text-[#62766f]">
                {advice.summary}
              </p>
            </div>
          </header>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {advice.suggestions.map((item, index) => (
              <article
                className="rounded-lg border border-[#e0e9e5] bg-[#f8faf9] p-4"
                key={`${item.title}-${index}`}
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-full bg-[#d9efe5] text-[10px] font-bold text-[#176b55]">
                    {index + 1}
                  </span>
                  <b className="text-xs">{item.title}</b>
                  {item.line && (
                    <span className="ml-auto rounded bg-[#e8efff] px-2 py-1 font-mono text-[9px] text-[#315f86]">
                      line {item.line}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] leading-6 text-[#62766f]">
                  {item.detail}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#fff7e2] p-4 text-[11px] leading-6 text-[#805e10]">
            <ChevronRight size={15} className="mt-1 shrink-0" />
            <span>
              <b>ลองทำต่อ:</b> {advice.nextStep}
            </span>
          </div>
        </section>
      )}

      {!aiAvailable && (
        <p className="text-center text-[11px] text-[#879890]">
          ปุ่มคำแนะนำ AI จะแสดงพร้อมใช้งานเมื่อผู้ดูแลเปิด AI
          สำหรับผู้เรียนและระบบเชื่อมต่อสำเร็จ
        </p>
      )}
    </div>
  );
}

function formatOutput(result: PlaygroundRunResult) {
  return (
    [
      result.compileOutput,
      result.stdout,
      result.stderr,
      result.message,
    ]
      .filter(Boolean)
      .join("\n") || (result.statusId === 3 ? "โปรแกรมทำงานสำเร็จ (ไม่มี output)" : result.status)
  );
}
