import {
  CalendarClock,
  CheckCircle2,
  Code2,
  ExternalLink,
  Eye,
  FileUp,
  LoaderCircle,
  NotebookPen,
  Pencil,
  Play,
  Plus,
  Terminal,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { EmptyState } from "../components/ui/StateViews";
import type {
  AssignmentSubmitPayload,
  CodeRunResult,
  StudentAssignment,
} from "../types/assignment";

export function AssignmentsPage({
  rows,
  saving,
  onSubmit,
  onRun,
}: {
  rows: StudentAssignment[];
  saving: boolean;
  onSubmit: (id: string, payload: AssignmentSubmitPayload) => Promise<boolean>;
  onRun: (
    id: string,
    sourceCode: string,
    stdin: string,
  ) => Promise<CodeRunResult>;
}) {
  const [tab, setTab] = useState<"pending" | "submitted" | "graded">("pending");
  const [selected, setSelected] = useState<StudentAssignment | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [stdin, setStdin] = useState("");
  const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
  const [runError, setRunError] = useState("");
  const [running, setRunning] = useState(false);
  const [runPhase, setRunPhase] = useState<
    "idle" | "queued" | "running" | "success" | "compile-error" | "timeout"
  >("idle");
  const [viewingCode, setViewingCode] = useState<StudentAssignment | null>(
    null,
  );
  const [groupName, setGroupName] = useState("");
  const [submitterRole, setSubmitterRole] = useState("");
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([""]);
  const counts = {
    pending: rows.filter((row) => !row.submissions[0]).length,
    submitted: rows.filter((row) => row.submissions[0]?.status === "SUBMITTED")
      .length,
    graded: rows.filter((row) => row.submissions[0]?.status === "GRADED")
      .length,
  };
  const visible = useMemo(
    () =>
      rows.filter((row) => {
        const item = row.submissions[0];
        return tab === "pending"
          ? !item
          : tab === "submitted"
            ? item?.status === "SUBMITTED"
            : item?.status === "GRADED";
      }),
    [rows, tab],
  );
  const date = (value: string) =>
    new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const members = Object.entries(memberRoles).map(([studentId, role]) => ({
      studentId,
      role: role.trim(),
    }));
    if (
      selected.isGroupWork &&
      (!groupName.trim() ||
        !submitterRole.trim() ||
        members.some((member) => !member.role) ||
        members.length + 1 < selected.minGroupSize)
    )
      return;
    const submitted = await onSubmit(selected.id, {
      content: String(data.get("content") ?? "") || undefined,
      attachmentUrls: attachmentUrls
        .map((url) => url.trim())
        .filter((url, index, rows) => url && rows.indexOf(url) === index),
      ...(selected.isGroupWork
        ? {
            groupName: groupName.trim(),
            submitterRole: submitterRole.trim(),
            members,
          }
        : {}),
    });
    if (submitted) setSelected(null);
  };
  const openSubmission = (row: StudentAssignment) => {
    setSelected(row);
    setCodeValue(row.submissions[0]?.content ?? "");
    setStdin("");
    setRunResult(null);
    setRunError("");
    setRunPhase("idle");
    const submission = row.submissions[0];
    const eligibleIds = new Set(row.eligibleMembers.map((member) => member.id));
    setGroupName(submission?.groupName ?? "");
    setSubmitterRole(
      submission?.members.find((member) => !eligibleIds.has(member.studentId))
        ?.role ?? "",
    );
    setMemberRoles(
      Object.fromEntries(
        (submission?.members ?? [])
          .filter((member) => eligibleIds.has(member.studentId))
          .map((member) => [member.studentId, member.role]),
      ),
    );
    setAttachmentUrls(
      submission?.attachmentUrls?.length
        ? submission.attachmentUrls
        : submission?.attachmentUrl
          ? [submission.attachmentUrl]
          : [""],
    );
  };
  const runCode = async () => {
    if (!selected || !codeValue.trim() || running) return;
    setRunning(true);
    setRunPhase("queued");
    setRunError("");
    setRunResult(null);
    const runningTimer = window.setTimeout(() => setRunPhase("running"), 350);
    try {
      const result = await onRun(selected.id, codeValue, stdin);
      setRunResult(result);
      setRunPhase(
        result.statusId === 3
          ? "success"
          : result.statusId === 6
            ? "compile-error"
            : result.statusId === 5
              ? "timeout"
              : "idle",
      );
    } catch (error) {
      setRunError(
        error instanceof Error ? error.message : "ทดลองรันโค้ดไม่สำเร็จ",
      );
      setRunPhase("idle");
    } finally {
      window.clearTimeout(runningTimer);
      setRunning(false);
    }
  };
  return (
    <>
      <div className="mb-6 inline-flex rounded-lg bg-[#e8efeb] p-1">
        {[
          ["pending", "ต้องส่ง"],
          ["submitted", "รอตรวจ"],
          ["graded", "ตรวจแล้ว"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-xs font-bold transition sm:px-4 ${tab === key ? `${key === "pending" ? "bg-[#fff1ee] text-[#b94e3c] shadow-sm" : key === "submitted" ? "bg-[#fff7e2] text-[#9a651a] shadow-sm" : "bg-[#eff8f4] text-[#176b55] shadow-sm"}` : "text-[#71847d] hover:bg-white"}`}
            onClick={() => setTab(key as typeof tab)}
          >
            {label}
            <span
              className={`grid size-5 place-items-center rounded-full text-[10px] ${key === "pending" ? "bg-[#fee0d9]" : key === "submitted" ? "bg-[#ffe8a5]" : "bg-[#cdebdc]"}`}
            >
              {counts[key as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((row) => {
            const item = row.submissions[0];
            const late = !item && new Date() > new Date(row.dueAt);
            return (
              <article
                className="rounded-xl border border-[#dce7e2] bg-white p-5 shadow-[0_8px_28px_rgba(24,50,45,.05)]"
                key={row.id}
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#dff1ea] text-[#176b55]">
                    {row.type === "CODE" ? (
                      <Code2 size={20} />
                    ) : (
                      <NotebookPen size={20} />
                    )}
                  </span>
                  <div>
                    <span className="text-[10px] font-bold text-[#238568]">
                      {row.subject.name} · {row.classroom.name}
                    </span>
                    <h2 className="mt-1 text-base font-bold">{row.title}</h2>
                    {row.type === "CODE" && (
                      <span className="mt-1 inline-flex rounded bg-[#e8efff] px-2 py-1 text-[10px] font-bold text-[#315f86]">
                        Code ·{" "}
                        {row.codeLanguage === "CPP"
                          ? "C++"
                          : row.codeLanguage === "CSHARP"
                            ? "C#"
                            : row.codeLanguage}
                      </span>
                    )}
                    {row.isGroupWork && (
                      <span className="mt-1 ml-1 inline-flex items-center gap-1 rounded bg-[#f0eaff] px-2 py-1 text-[10px] font-bold text-[#6750a4]">
                        <Users size={12} /> งานกลุ่ม {row.minGroupSize}-
                        {row.maxGroupSize} คน
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-[#62766f]">
                  {row.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#edf2ef] pt-4 text-[11px] text-[#71847d]">
                  <span
                    className={`inline-flex items-center gap-1.5 ${late ? "font-bold text-[#bd5d35]" : ""}`}
                  >
                    <CalendarClock size={15} /> {date(row.dueAt)}
                  </span>
                  <b className="ml-auto text-[#18322d]">
                    {Number(row.maxScore)} คะแนน
                  </b>
                </div>
                {item ? (
                  <div className="mt-4 rounded-lg bg-[#f3f7f5] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#176b55]">
                      <CheckCircle2 size={17} />
                      {item.status === "GRADED"
                        ? `ได้ ${Number(item.score)}/${Number(row.maxScore)} คะแนน · ผลประเมิน ${item.assessment ?? "-"}`
                        : "ส่งงานแล้ว รอครูตรวจ"}
                    </div>
                    {item.feedback && (
                      <p className="mt-2 text-xs leading-6 text-[#62766f]">
                        คำแนะนำ: {item.feedback}
                      </p>
                    )}
                    {row.isGroupWork && item.groupName && (
                      <div className="mt-3 rounded-lg border border-[#ddd3f4] bg-white p-3 text-[11px] text-[#5e5078]">
                        <b className="block">กลุ่ม {item.groupName}</b>
                        <div className="mt-2 grid gap-1">
                          {item.members.map((member) => (
                            <span key={member.studentId}>
                              {member.student.user.firstName}{" "}
                              {member.student.user.lastName} — {member.role}
                              {item.status === "GRADED" && member.score != null
                                ? ` · ${Number(member.score)}/${Number(row.maxScore)} คะแนน`
                                : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(item.attachmentUrls?.length
                      ? item.attachmentUrls
                      : item.attachmentUrl
                        ? [item.attachmentUrl]
                        : []
                    ).map((url, index) => (
                      <a
                        className="mt-2 mr-3 inline-flex items-center gap-1 text-[11px] font-bold text-[#315f86]"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        key={url}
                      >
                        เปิดลิงก์งาน {index + 1} <ExternalLink size={13} />
                      </a>
                    ))}
                    {row.type === "CODE" && item.content && (
                      <button
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#18212f] px-3 py-2 text-[11px] font-bold text-[#9cdcfe]"
                        onClick={() => setViewingCode(row)}
                      >
                        <Eye size={14} /> อ่าน Source Code
                      </button>
                    )}
                    {item.status === "SUBMITTED" && item.canEdit !== false && (
                      <button
                        className="mt-3 ml-2 inline-flex items-center gap-1.5 rounded-lg border border-[#d7e6df] bg-white px-3 py-2 text-[11px] font-bold text-[#176b55] transition hover:bg-[#eff8f4]"
                        onClick={() => openSubmission(row)}
                      >
                        <Pencil size={14} /> แก้ไขงาน
                      </button>
                    )}
                  </div>
                ) : row.status === "CLOSED" ? (
                  <div className="mt-4 rounded-lg bg-[#edf0ee] px-4 py-3 text-center text-xs font-bold text-[#71847d]">
                    ปิดรับงานแล้ว
                  </div>
                ) : (
                  <button
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#176b55] px-4 py-3 text-xs font-bold text-white"
                    onClick={() => openSubmission(row)}
                  >
                    <FileUp size={16} />
                    {late ? "ส่งงานล่าช้า" : "ส่งงาน"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="ไม่มีงานในรายการนี้"
          text="งานที่ได้รับมอบหมายจะแสดงตามสถานะ"
        />
      )}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <section
            className={`max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${selected.type === "CODE" ? "max-w-3xl" : "max-w-lg"}`}
          >
            <header className="flex items-center justify-between border-b border-[#dce7e2] p-5">
              <div>
                <span className="text-[10px] font-bold text-[#238568]">
                  {selected.submissions[0]?.status === "SUBMITTED"
                    ? "แก้ไขงานที่ส่ง"
                    : "ส่งงาน"}
                </span>
                <h2 className="mt-1 font-bold">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)}>
                <X />
              </button>
            </header>
            <form onSubmit={submit}>
              <div className="grid gap-4 p-5">
                {selected.isGroupWork && (
                  <section className="grid gap-3 rounded-xl border border-[#ddd3f4] bg-[#faf8ff] p-4">
                    <div>
                      <b className="flex items-center gap-2 text-sm text-[#5e5078]">
                        <Users size={17} /> สมาชิกกลุ่ม
                      </b>
                      <p className="mt-1 text-[10px] text-[#7d7192]">
                        เลือกได้เฉพาะเพื่อนห้อง {selected.classroom.name} · รวมคุณแล้ว {selected.minGroupSize}-{selected.maxGroupSize} คน
                      </p>
                    </div>
                    <label className="grid gap-2 text-xs font-bold">
                      ชื่อกลุ่ม
                      <input
                        className="rounded-lg border border-[#ddd3f4] bg-white p-3 font-normal outline-none focus:border-[#7a63b8]"
                        value={groupName}
                        onChange={(event) => setGroupName(event.target.value)}
                        maxLength={100}
                        required
                      />
                    </label>
                    <label className="grid gap-2 text-xs font-bold">
                      หน้าที่ของคุณ
                      <input
                        className="rounded-lg border border-[#ddd3f4] bg-white p-3 font-normal outline-none focus:border-[#7a63b8]"
                        value={submitterRole}
                        onChange={(event) => setSubmitterRole(event.target.value)}
                        placeholder="เช่น หัวหน้ากลุ่ม / รวบรวมข้อมูล"
                        maxLength={200}
                        required
                      />
                    </label>
                    <div className="grid gap-2">
                      <span className="text-xs font-bold">เพิ่มเพื่อนและระบุหน้าที่</span>
                      {selected.eligibleMembers.map((student) => {
                        const selectedMember = student.id in memberRoles;
                        return (
                          <div className="grid gap-2 rounded-lg border border-[#e4def2] bg-white p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center" key={student.id}>
                            <label className="flex items-center gap-2 text-xs">
                              <input
                                type="checkbox"
                                checked={selectedMember}
                                disabled={
                                  !selectedMember &&
                                  Object.keys(memberRoles).length + 1 >= selected.maxGroupSize
                                }
                                onChange={(event) =>
                                  setMemberRoles((current) => {
                                    const next = { ...current };
                                    if (event.target.checked) next[student.id] = "";
                                    else delete next[student.id];
                                    return next;
                                  })
                                }
                              />
                              <span>
                                <b>{student.user.firstName} {student.user.lastName}</b>
                                <small className="block text-[9px] text-[#879890]">{student.studentCode}</small>
                              </span>
                            </label>
                            {selectedMember && (
                              <input
                                className="rounded-lg border border-[#ddd3f4] p-2 text-xs outline-none focus:border-[#7a63b8]"
                                value={memberRoles[student.id]}
                                onChange={(event) =>
                                  setMemberRoles((current) => ({
                                    ...current,
                                    [student.id]: event.target.value,
                                  }))
                                }
                                placeholder="หน้าที่ในกลุ่ม"
                                maxLength={200}
                                required
                              />
                            )}
                            {selectedMember && <Trash2 size={15} className="hidden text-[#a66767] sm:block" />}
                          </div>
                        );
                      })}
                      <small className="text-[10px] text-[#7d7192]">
                        เลือกแล้ว {Object.keys(memberRoles).length + 1} คน
                      </small>
                    </div>
                  </section>
                )}
                {selected.type === "CODE" ? (
                  <label className="grid gap-2 text-xs font-bold">
                    {selected.type === "CODE"
                      ? `Source code (${selected.codeLanguage === "CPP" ? "C++" : selected.codeLanguage === "CSHARP" ? "C#" : selected.codeLanguage})`
                      : "รายละเอียด / คำตอบ"}
                    <CodeEditor
                      name="content"
                      language={selected.codeLanguage ?? "PYTHON"}
                      value={codeValue}
                      onChange={setCodeValue}
                    />
                  </label>
                ) : (
                  <label className="grid gap-2 text-xs font-bold">
                    รายละเอียด / คำตอบ
                    <textarea
                      className="min-h-32 rounded-lg border border-[#dce7e2] p-3 font-normal outline-none focus:border-[#238568]"
                      name="content"
                      defaultValue={selected.submissions[0]?.content ?? ""}
                      placeholder="พิมพ์รายละเอียดงานที่ส่ง"
                    />
                  </label>
                )}
                {selected.type === "CODE" && (
                  <section className="overflow-hidden rounded-lg border border-[#303b4d] bg-[#111827] text-white">
                    <header className="flex flex-wrap items-center gap-2 border-b border-[#303b4d] px-4 py-3">
                      <Terminal size={16} className="text-[#9cdcfe]" />
                      <b className="text-xs">ทดลองรันโค้ด</b>
                      <span className="text-[10px] text-[#94a3b8]">
                        ไม่ถือว่าเป็นการส่งงาน
                      </span>
                      <button
                        type="button"
                        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md bg-[#238568] px-3 text-[11px] font-bold text-white transition hover:bg-[#176b55] disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={running || !codeValue.trim()}
                        onClick={() => void runCode()}
                      >
                        {running ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Play size={14} fill="currentColor" />
                        )}
                        {running
                          ? runPhase === "queued"
                            ? "รอคิว..."
                            : "กำลังรัน..."
                          : "Run"}
                      </button>
                    </header>
                    <div className="grid gap-3 p-4 sm:grid-cols-[.85fr_1.15fr]">
                      <label className="grid content-start gap-2 text-[10px] font-bold text-[#cbd5e1]">
                        Input (stdin)
                        <textarea
                          className="min-h-28 resize-y rounded-md border border-[#3d485a] bg-[#0b1019] p-3 font-mono text-[11px] font-normal text-white outline-none focus:border-[#238568]"
                          value={stdin}
                          onChange={(event) => setStdin(event.target.value)}
                          placeholder="ข้อมูลนำเข้าสำหรับโปรแกรม (ถ้ามี)"
                        />
                      </label>
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#cbd5e1]">
                          <span>Console</span>
                          {runPhase !== "idle" && !runResult && !runError && (
                            <span className="text-[#ffbd66]">
                              {runPhase === "queued" ? "รอคิว" : "กำลังรัน"}
                            </span>
                          )}
                          {runResult && (
                            <span
                              className={
                                runResult.statusId === 3
                                  ? "text-[#5ee1ad]"
                                  : runResult.statusId === 6 ||
                                      runResult.statusId === 5
                                    ? "text-[#ff9c9c]"
                                    : "text-[#ffbd66]"
                              }
                            >
                              {runResult.statusId === 3
                                ? "สำเร็จ"
                                : runResult.statusId === 6
                                  ? "Compile Error"
                                  : runResult.statusId === 5
                                    ? "Timeout"
                                    : runResult.status}
                              {runResult.time !== null
                                ? ` · ${runResult.time.toFixed(3)}s`
                                : ""}
                              {runResult.memory !== null
                                ? ` · ${runResult.memory} KB`
                                : ""}
                            </span>
                          )}
                        </div>
                        <pre
                          className={`min-h-28 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-md border p-3 font-mono text-[11px] font-normal leading-5 ${runError || (runResult && runResult.statusId !== 3) ? "border-[#6d3e42] bg-[#1c1014] text-[#ff9c9c]" : "border-[#3d485a] bg-[#0b1019] text-[#d4d4d4]"}`}
                        >
                          {runError ||
                            (runResult
                              ? formatRunOutput(runResult)
                              : "ผลลัพธ์จะแสดงที่นี่")}
                        </pre>
                      </div>
                    </div>
                  </section>
                )}
                <section className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <b className="text-xs">ลิงก์ไฟล์งาน (เพิ่มได้หลายลิงก์)</b>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-[#dce7e2] px-2.5 py-1.5 text-[10px] font-bold text-[#176b55]"
                        onClick={() =>
                          setAttachmentUrls((current) => [...current, ""])
                        }
                        disabled={attachmentUrls.length >= 20}
                      >
                        <Plus size={13} /> เพิ่มลิงก์
                      </button>
                    </div>
                    {attachmentUrls.map((url, index) => (
                      <div className="flex gap-2" key={index}>
                        <input
                          className="min-w-0 flex-1 rounded-lg border border-[#dce7e2] p-3 text-xs font-normal outline-none focus:border-[#238568]"
                          type="url"
                          value={url}
                          onChange={(event) =>
                            setAttachmentUrls((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? event.target.value : item,
                              ),
                            )
                          }
                          placeholder={`https://... (ลิงก์ที่ ${index + 1})`}
                        />
                        <button
                          type="button"
                          className="grid size-10 shrink-0 place-items-center rounded-lg border border-[#f0d8d8] text-[#a45a5a]"
                          aria-label={`ลบลิงก์ที่ ${index + 1}`}
                          onClick={() =>
                            setAttachmentUrls((current) =>
                              current.length === 1
                                ? [""]
                                : current.filter(
                                    (_, itemIndex) => itemIndex !== index,
                                  ),
                            )
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                </section>
                {selected.type === "CODE" && (
                  <div
                    className={`rounded-lg p-3 text-[11px] leading-5 ${selected.aiGradingEnabled ? "bg-[#e8f5ef] text-[#176b55]" : "bg-[#fff7e2] text-[#805e10]"}`}
                  >
                    {selected.aiGradingEnabled
                      ? "ระบบจะตรวจ ให้คะแนน และแนะนำอัตโนมัติทันทีหลังส่ง"
                      : "งานนี้ปิดการตรวจอัตโนมัติ กรุณารอครูตรวจด้วยตนเองหลังส่ง"}
                  </div>
                )}
                <p className="text-[10px] text-[#879890]">
                  {selected.type === "CODE"
                    ? "ต้องมี Source code และสามารถแนบลิงก์เพิ่มเติมได้"
                    : "กรอกรายละเอียดหรือแนบอย่างน้อยหนึ่งลิงก์"}
                  {" · "}สามารถแก้ไขการส่งได้จนกว่าครูจะตรวจคะแนน
                </p>
              </div>
              <footer className="flex justify-end gap-2 border-t border-[#dce7e2] p-4">
                <button
                  type="button"
                  className="student-button-secondary"
                  onClick={() => setSelected(null)}
                >
                  ยกเลิก
                </button>
                <button className="student-button-primary" disabled={saving}>
                  {saving
                    ? "กำลังบันทึก..."
                    : selected.submissions[0]?.status === "SUBMITTED"
                      ? "บันทึกการแก้ไข"
                      : "ยืนยันส่งงาน"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {viewingCode && viewingCode.submissions[0]?.content && (
        <CodeViewer
          title={viewingCode.title}
          language={viewingCode.codeLanguage ?? "PYTHON"}
          code={viewingCode.submissions[0].content}
          onClose={() => setViewingCode(null)}
        />
      )}
    </>
  );
}

function CodeEditor({
  name,
  language,
  value,
  onChange,
}: {
  name: string;
  language: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const extension = language === "PYTHON" ? python() : cpp();
  return (
    <div className="overflow-hidden rounded-xl border border-[#303b4d] bg-[#0f1722] shadow-xl">
      <IdeBar language={language} />
      <CodeMirror
        value={value}
        onChange={onChange}
        height="320px"
        theme={vscodeDark}
        extensions={[extension]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          indentOnInput: true,
          foldGutter: true,
        }}
        className="text-left text-[12px]"
      />
      <textarea name={name} value={value} readOnly className="hidden" />
    </div>
  );
}

function CodeViewer({
  title,
  language,
  code,
  onClose,
}: {
  title: string;
  language: string;
  code: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-[#0f1722] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#303b4d] px-5 py-4 text-white">
          <div>
            <span className="text-[10px] font-bold text-[#9cdcfe]">
              SOURCE CODE
            </span>
            <h2 className="mt-1 font-bold">{title}</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </header>
        <IdeBar language={language} />
        <pre className="max-h-[70vh] overflow-auto whitespace-pre p-5 font-mono text-[12px] leading-6">
          <HighlightedCode code={code} language={language} />
        </pre>
      </section>
    </div>
  );
}

function IdeBar({ language }: { language: string }) {
  return (
    <div className="flex h-9 items-center gap-2 border-b border-[#303b4d] bg-[#18212f] px-4">
      <i className="size-2.5 rounded-full bg-[#ff5f57]" />
      <i className="size-2.5 rounded-full bg-[#febc2e]" />
      <i className="size-2.5 rounded-full bg-[#28c840]" />
      <span className="ml-2 font-mono text-[10px] font-normal text-[#94a3b8]">
        main.
        {language === "PYTHON"
          ? "py"
          : language === "CSHARP"
            ? "cs"
            : language === "CPP"
              ? "cpp"
              : "c"}
      </span>
    </div>
  );
}

function formatRunOutput(result: CodeRunResult) {
  const parts = [
    result.compileOutput && `Compile output:\n${result.compileOutput}`,
    result.stdout && `Output:\n${result.stdout}`,
    result.stderr && `Error:\n${result.stderr}`,
    result.message && `Message:\n${result.message}`,
  ].filter(Boolean);
  return parts.join("\n\n") || "โปรแกรมทำงานเสร็จแล้วโดยไม่มีข้อความแสดงผล";
}

function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const keywords = new RegExp(`\\b(${[...CODE_KEYWORDS].join("|")})\\b`, "g");
  const tokenPattern =
    language === "PYTHON"
      ? /(#.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)/gm
      : /(\/\*[\s\S]*?\*\/|\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)/gm;
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of code.matchAll(tokenPattern)) {
    if (match.index! > last)
      parts.push(
        <KeywordText
          key={`t${last}`}
          text={code.slice(last, match.index)}
          pattern={keywords}
        />,
      );
    const tone = match[1]
      ? "text-[#6a9955]"
      : match[2]
        ? "text-[#ce9178]"
        : "text-[#b5cea8]";
    parts.push(
      <span className={tone} key={`m${match.index}`}>
        {match[0]}
      </span>,
    );
    last = match.index! + match[0].length;
  }
  if (last < code.length)
    parts.push(
      <KeywordText
        key={`t${last}`}
        text={code.slice(last)}
        pattern={keywords}
      />,
    );
  return <code className="text-[#d4d4d4]">{parts}</code>;
}

function KeywordText({ text, pattern }: { text: string; pattern: RegExp }) {
  return (
    <>
      {text.split(pattern).map((part, index) =>
        CODE_KEYWORDS.has(part) ? (
          <span className="text-[#569cd6]" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

const CODE_KEYWORDS = new Set(
  "auto break case catch char class const continue def delete do double else enum except false finally float for foreach from if import in include int interface lambda long namespace new null None operator private protected public raise return short signed sizeof static string struct switch this throw true True try typedef typename union unsigned using var virtual void while".split(
    " ",
  ),
);
