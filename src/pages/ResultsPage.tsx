import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Sparkles,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../components/ui/StateViews";
import type { StudentAssignment } from "../types/assignment";
import type { AttemptResult, StudentExam } from "../types/exam";
import type { LearningRecords, SubjectRecord } from "../types/record";

export function ResultsPage({
  exams,
  assignments,
  records,
  detail,
  onOpen,
}: {
  exams: StudentExam[];
  assignments: StudentAssignment[];
  records: LearningRecords | null;
  detail: AttemptResult | null;
  onOpen: (id: string) => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const results = exams
    .flatMap((exam) =>
      exam.attempts
        .filter((item) => item.status === "GRADED")
        .map((attempt) => ({ exam, attempt })),
    )
    .sort(
      (a, b) =>
        new Date(b.attempt.submittedAt || 0).getTime() -
        new Date(a.attempt.submittedAt || 0).getTime(),
    );
  const subjects = useMemo(
    () =>
      records?.classrooms.flatMap(({ classroom, subjects: rows }) =>
        rows.map((subject) => ({
          key: subjectKey(classroom.id, subject.subject.id),
          classroom,
          subject,
        })),
      ) ?? [],
    [records],
  );
  const selected = subjects.find((item) => item.key === selectedKey);

  if (detail) return <ExamDetail detail={detail} />;
  if (selected)
    return (
      <SubjectDetail
        classroom={selected.classroom}
        record={selected.subject}
        gradeScale={records?.gradeScale ?? {}}
        assignments={assignments}
        onBack={() => setSelectedKey(null)}
        onOpen={onOpen}
      />
    );

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Award className="text-[#c56c19]" size={20} />
          <h2 className="font-bold">สรุปผลการเรียนรายวิชา</h2>
        </div>
        {records?.classrooms.length ? (
          <div className="space-y-5">
            {records.classrooms.map(({ classroom, subjects: rows }) => (
              <section
                key={classroom.id}
                className="overflow-hidden rounded-lg border border-[#dce7e2] bg-white"
              >
                <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf2ef] bg-[#f7faf8] px-5 py-4">
                  <div>
                    <b>{classroom.name}</b>
                    <span className="ml-2 text-xs text-[#71847d]">
                      {classroom.gradeLevel || ""} · ปีการศึกษา{" "}
                      {classroom.academicYear}
                    </span>
                  </div>
                  <span className="text-xs text-[#71847d]">
                    {rows.length} วิชา
                  </span>
                </header>
                <div className="divide-y divide-[#edf2ef]">
                  {rows.map((item) => (
                    <button
                      className="grid w-full grid-cols-[1fr_auto] gap-4 p-5 text-left transition hover:bg-[#f7faf8] sm:grid-cols-[1fr_auto_auto_auto]"
                      key={item.subject.id}
                      onClick={() =>
                        setSelectedKey(
                          subjectKey(classroom.id, item.subject.id),
                        )
                      }
                    >
                      <div className="min-w-0">
                        <b className="block truncate text-sm">
                          {item.subject.name}
                        </b>
                        <span className="mt-1 block text-xs text-[#71847d]">
                          {item.subject.code} · แบบทดสอบ {item.exams.length} ·
                          งาน {item.assignments.length}
                        </span>
                        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#526a62]">
                          <span className="inline-flex items-center gap-1 rounded bg-[#edf5f1] px-2 py-1">
                            <BookOpen size={13} /> สอบ{" "}
                            {sum(item.exams, "score")}/
                            {sum(item.exams, "maxScore")}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-[#fff7e2] px-2 py-1">
                            <ClipboardCheck size={13} /> งาน{" "}
                            {sum(item.assignments, "score")}/
                            {sum(item.assignments, "maxScore")}
                          </span>
                        </div>
                      </div>
                      <div className="self-center text-right">
                        <b className="text-xl text-[#176b55]">
                          {formatPercent(item.percentage)}
                        </b>
                        <span className="mt-1 block text-[11px] text-[#71847d]">
                          {item.score}/{item.maxScore} คะแนน
                        </span>
                      </div>
                      <span className="grid size-12 place-self-center place-items-center rounded-lg bg-[#176b55] text-xl font-bold text-white">
                        {item.grade || "-"}
                      </span>
                      <ChevronRight
                        className="hidden self-center text-[#879890] sm:block"
                        size={18}
                      />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState
            title="ยังไม่มีผลการเรียน"
            text="เกรดจะคำนวณเมื่อครูตรวจงานหรือข้อสอบแล้ว"
          />
        )}
      </section>
      {results.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">ประวัติแบบทดสอบ</h2>
          <div className="divide-y divide-[#edf2ef] overflow-hidden rounded-lg border border-[#dce7e2] bg-white">
            {results.map(({ exam, attempt }) => (
              <button
                className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 p-5 text-left transition hover:bg-[#f7faf8]"
                key={attempt.id}
                onClick={() => onOpen(attempt.id)}
              >
                <span className="grid size-11 place-items-center rounded-lg bg-[#fff0c8] text-[#805e10]">
                  <Award size={20} />
                </span>
                <div className="min-w-0">
                  <b className="block truncate text-sm">{exam.title}</b>
                  <span className="mt-1 block text-[11px] text-[#879890]">
                    {exam.subject.name} · ครั้งที่ {attempt.attemptNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <b className="text-xl text-[#176b55]">
                    {Number(attempt.percentage ?? 0).toFixed(0)}%
                  </b>
                  <ArrowRight
                    className="hidden text-[#879890] transition group-hover:translate-x-1 sm:block"
                    size={17}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SubjectDetail({
  classroom,
  record,
  gradeScale,
  assignments,
  onBack,
  onOpen,
}: {
  classroom: SubjectRecord["classroom"];
  record: SubjectRecord;
  gradeScale: Record<string, number>;
  assignments: StudentAssignment[];
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const assignmentGrades = new Map(
    assignments.flatMap((assignment) =>
      assignment.submissions.map(
        (submission) => [submission.id, submission.grade] as const,
      ),
    ),
  );
  return (
    <div className="space-y-7">
      <button
        className="inline-flex items-center gap-2 text-xs font-bold text-[#176b55]"
        onClick={onBack}
      >
        <ArrowLeft size={16} /> กลับไปสรุปผลรายวิชา
      </button>
      <section className="grid overflow-hidden rounded-lg bg-[#18322d] text-white md:grid-cols-[1fr_210px]">
        <div className="p-6 sm:p-8">
          <span className="text-xs font-semibold text-[#9fddc8]">
            {classroom.name} · {record.subject.code}
          </span>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {record.subject.name}
          </h2>
          <p className="mt-3 text-xs leading-6 text-white/65">
            รวมคะแนนงานและแบบทดสอบที่ครูตรวจแล้ว คะแนนเต็มรายวิชา 100 คะแนน
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
            {Object.entries(gradeScale).map(([grade, minimum]) => (
              <span
                className="rounded-md bg-white/10 px-2.5 py-1.5"
                key={grade}
              >
                {grade} ตั้งแต่ {minimum}%
              </span>
            ))}
          </div>
        </div>
        <div className="grid place-content-center bg-[#f5c94a] p-7 text-center text-[#18322d]">
          <span className="text-xs font-semibold">เกรดรายวิชา</span>
          <b className="mt-1 text-6xl leading-none">{record.grade || "-"}</b>
          <span className="mt-3 text-xs font-bold">
            {formatPercent(record.percentage)} · {record.score}/
            {record.maxScore} คะแนน
          </span>
        </div>
      </section>
      <section>
        <SectionTitle
          icon={<BookOpen size={18} />}
          title="คะแนนแบบทดสอบ"
          count={record.exams.length}
        />
        {record.exams.length ? (
          <div className="divide-y divide-[#edf2ef] overflow-hidden rounded-lg border border-[#dce7e2] bg-white">
            {record.exams.map((exam) => (
              <button
                className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-5 text-left transition hover:bg-[#f7faf8] sm:grid-cols-[1fr_auto_auto]"
                key={exam.id}
                onClick={() => onOpen(exam.id)}
              >
                <div className="min-w-0">
                  <b className="block truncate text-sm">{exam.title}</b>
                  <span className="mt-1 block text-[11px] text-[#71847d]">
                    ตรวจเมื่อ {formatDate(exam.gradedAt)}
                  </span>
                </div>
                <div className="text-right">
                  <b className="text-base text-[#176b55]">
                    {formatAssessmentPercent(exam.score, exam.maxScore)}
                  </b>
                  <span className="mt-1 block text-[11px] text-[#71847d]">
                    {exam.score}/{exam.maxScore} คะแนน
                  </span>
                </div>
                <ArrowRight
                  className="hidden text-[#879890] sm:block"
                  size={17}
                />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="ยังไม่มีคะแนนแบบทดสอบ"
            text="ผลที่ครูตรวจแล้วจะแสดงในส่วนนี้"
          />
        )}
      </section>
      <section>
        <SectionTitle
          icon={<ClipboardCheck size={18} />}
          title="รายละเอียดงาน"
          count={record.assignments.length}
        />
        {record.assignments.length ? (
          <div className="divide-y divide-[#edf2ef] overflow-hidden rounded-lg border border-[#dce7e2] bg-white">
            {record.assignments.map((assignment) => {
              const grade = assignmentGrades.get(assignment.id);
              return (
                <article
                  className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 sm:grid-cols-[1fr_auto_auto]"
                  key={assignment.id}
                >
                  <div className="min-w-0">
                    <b className="block truncate text-sm">{assignment.title}</b>
                    <span className="mt-1 block text-[11px] text-[#71847d]">
                      ตรวจเมื่อ {formatDate(assignment.gradedAt)}
                    </span>
                  </div>
                  <div className="text-right">
                    <b className="text-base text-[#176b55]">
                      {formatAssessmentPercent(
                        assignment.score,
                        assignment.maxScore,
                      )}
                    </b>
                    <span className="mt-1 block text-[11px] text-[#71847d]">
                      {assignment.score}/{assignment.maxScore} คะแนน
                    </span>
                  </div>
                  <span className="grid size-10 place-self-center place-items-center rounded-lg bg-[#fff0c8] text-sm font-bold text-[#805e10]">
                    {grade || "-"}
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="ยังไม่มีงานที่ตรวจแล้ว"
            text="คะแนนงานที่ครูตรวจแล้วจะแสดงในส่วนนี้"
          />
        )}
      </section>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
}) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-[#176b55]">{icon}</span>
      <h3 className="font-bold">{title}</h3>
      <span className="rounded-md bg-[#e8efeb] px-2 py-0.5 text-[10px] font-bold text-[#526a62]">
        {count}
      </span>
    </div>
  );
}

function ExamDetail({ detail }: { detail: AttemptResult }) {
  const report = detail.aiReport;
  const score = Number(detail.percentage ?? 0);
  return (
    <div className="space-y-6">
      <section className="grid overflow-hidden rounded-lg bg-[#18322d] text-white md:grid-cols-[230px_1fr]">
        <div className="grid place-content-center bg-[#f5c94a] p-7 text-center text-[#18322d]">
          <span className="text-xs font-semibold">คะแนนของคุณ</span>
          <b className="mt-1 text-5xl">{score.toFixed(0)}%</b>
          <span className="mt-1 text-[11px]">
            {Number(detail.score ?? 0)} / {Number(detail.maxScore ?? 0)} คะแนน
          </span>
        </div>
        <div className="p-6 sm:p-8">
          <span className="text-xs text-[#9fddc8]">
            ผลการทำแบบทดสอบ ครั้งที่ {detail.attemptNumber}
          </span>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            {detail.exam.title}
          </h2>
          <p className="mt-3 text-xs leading-6 text-white/65">
            {score >= 80
              ? "ยอดเยี่ยม คุณเข้าใจเนื้อหาส่วนใหญ่ได้ดี"
              : score >= 60
                ? "ทำได้ดี และยังมีบางจุดที่พัฒนาได้อีก"
                : "นี่คือจุดเริ่มต้นที่ดี ลองดูคำแนะนำแล้วค่อยกลับมาทบทวน"}
          </p>
        </div>
      </section>
      {report && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="text-[#c56c19]" size={20} />
            <h3 className="font-bold">สิ่งที่ค้นพบจากคำตอบของคุณ</h3>
          </div>
          {report.summary && (
            <p className="mb-5 max-w-3xl text-sm leading-7 text-[#526a62]">
              {report.summary}
            </p>
          )}
          <div className="grid gap-3 md:grid-cols-3">
            <ReportList
              title="ทำได้ดี"
              items={report.strengths}
              color="green"
            />
            <ReportList
              title="ลองทบทวน"
              items={report.weaknesses}
              color="yellow"
            />
            <ReportList
              title="ก้าวต่อไป"
              items={report.recommendations}
              color="blue"
            />
          </div>
        </section>
      )}
      <section className="rounded-lg border border-[#dce7e2] bg-white p-5 sm:p-6">
        <h3 className="font-bold">ดูคำตอบทีละข้อ</h3>
        <div className="mt-3 divide-y divide-[#edf2ef]">
          {detail.answers.map((item, index) => (
            <div
              className="grid grid-cols-[auto_1fr_auto] gap-3 py-5"
              key={item.id}
            >
              {item.isCorrect ? (
                <CheckCircle2 className="text-[#238568]" size={21} />
              ) : (
                <XCircle className="text-[#cf6857]" size={21} />
              )}
              <div>
                <b className="whitespace-pre-wrap text-sm leading-6">
                  ข้อ {index + 1}: {item.question?.prompt}
                </b>
                {item.feedback && (
                  <p className="mt-1 text-xs leading-6 text-[#71847d]">
                    {item.feedback}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs font-bold">
                {Number(item.score ?? 0)}/{Number(item.question?.maxScore ?? 0)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportList({
  title,
  items = [],
  color,
}: {
  title: string;
  items?: string[];
  color: "green" | "yellow" | "blue";
}) {
  const icon =
    color === "green" ? (
      <TrendingUp />
    ) : color === "yellow" ? (
      <Target />
    ) : (
      <Sparkles />
    );
  const classes =
    color === "green"
      ? "bg-[#dff1ea] text-[#176b55]"
      : color === "yellow"
        ? "bg-[#fff0c8] text-[#805e10]"
        : "bg-[#e4effa] text-[#315f86]";
  return (
    <div className={`rounded-lg p-5 ${classes}`}>
      <b className="flex items-center gap-2 text-xs [&>svg]:size-4">
        {icon}
        {title}
      </b>
      <ul className="mt-3 space-y-2 text-[11px] leading-5">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function subjectKey(classroomId: string, subjectId: string) {
  return `${classroomId}:${subjectId}`;
}
function sum(
  rows: Array<{ score: number; maxScore: number }>,
  key: "score" | "maxScore",
) {
  return rows.reduce((total, item) => total + item[key], 0);
}
function formatPercent(value: number | null) {
  return value === null ? "-" : `${value.toFixed(0)}%`;
}
function formatAssessmentPercent(score: number, maxScore: number) {
  return maxScore ? `${((score / maxScore) * 100).toFixed(0)}%` : "-";
}
function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "รอตรวจ";
}
