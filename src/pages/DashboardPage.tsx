import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  NotebookPen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ExamCard } from "../components/exam/ExamCard";
import { EmptyState } from "../components/ui/StateViews";
import type { StudentAssignment } from "../types/assignment";
import type { StudentProfile } from "../types/auth";
import type { StudentExam } from "../types/exam";

export function DashboardPage({
  profile,
  exams,
  assignments,
  onTake,
  onResult,
  onAllExams,
  onAllAssignments,
}: {
  profile: StudentProfile;
  exams: StudentExam[];
  assignments: StudentAssignment[];
  onTake: (exam: StudentExam) => void;
  onResult: (id: string) => void;
  onAllExams: () => void;
  onAllAssignments: () => void;
}) {
  const now = Date.now();
  const attempts = exams.flatMap((exam) => exam.attempts);
  const graded = attempts.filter((attempt) => attempt.status === "GRADED");
  const average = graded.length
    ? graded.reduce((sum, item) => sum + Number(item.percentage ?? 0), 0) /
      graded.length
    : 0;
  const pendingAssignments = assignments
    .filter((assignment) => !assignment.submissions.length)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
  const overdueAssignments = pendingAssignments.filter(
    (assignment) => new Date(assignment.dueAt).getTime() < now,
  );
  const unfinishedExams = exams.filter(
    (exam) =>
      exam.status === "PUBLISHED" &&
      !exam.attempts.some((attempt) => attempt.status === "GRADED"),
  );
  const inProgress = unfinishedExams.find((exam) =>
    exam.attempts.some((item) => item.status === "IN_PROGRESS"),
  );
  const nextExam =
    inProgress ??
    unfinishedExams.find(
      (exam) =>
        exam.attempts.length < exam.maxAttempts &&
        (!exam.availableFrom ||
          new Date(exam.availableFrom).getTime() <= now) &&
        (!exam.availableUntil ||
          new Date(exam.availableUntil).getTime() >= now),
    );
  const pendingTotal = pendingAssignments.length + unfinishedExams.length;

  return (
    <div className="space-y-9">
      <section className="grid overflow-hidden rounded-lg bg-[#18322d] text-white lg:grid-cols-[1fr_300px]">
        <div className="p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#9fddc8]">
            <Sparkles size={15} />
            สวัสดี {profile.firstName}
          </span>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-[1.45] sm:text-3xl">
            {pendingTotal
              ? `วันนี้มี ${pendingTotal} รายการที่รอคุณอยู่`
              : "วันนี้ไม่มีงานค้าง ใช้เวลาทบทวนสิ่งที่เรียนมาได้เต็มที่"}
          </h2>
          <p className="mt-3 max-w-xl text-xs leading-6 text-white/65">
            {pendingTotal
              ? `งานค้าง ${pendingAssignments.length} งาน · ข้อสอบที่ยังไม่ทำ ${unfinishedExams.length} ชุด`
              : "ทุกงานเสร็จเรียบร้อยแล้ว เก่งมาก รักษาจังหวะนี้ไว้ได้เลย"}
          </p>
          {nextExam && (
            <button
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[#f5c94a] px-5 text-xs font-bold text-[#18322d] transition hover:bg-[#ffda67]"
              onClick={() => onTake(nextExam)}
            >
              {inProgress ? "ทำข้อสอบต่อ" : "เริ่มข้อสอบถัดไป"}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 border-t border-white/10 bg-[#21483f] lg:grid-cols-1 lg:border-l lg:border-t-0">
          <Stat
            icon={<NotebookPen />}
            label="งานค้าง"
            value={pendingAssignments.length}
          />
          <Stat
            icon={<AlertCircle />}
            label="เลยกำหนด"
            value={overdueAssignments.length}
          />
          <Stat
            icon={<BookOpenCheck />}
            label="ข้อสอบยังไม่ทำ"
            value={unfinishedExams.length}
          />
          <Stat
            icon={<TrendingUp />}
            label="คะแนนเฉลี่ย"
            value={graded.length ? `${average.toFixed(0)}%` : "-"}
          />
        </div>
      </section>
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold">รายงานรายการค้าง</h2>
          <p className="mt-1 text-xs text-[#71847d]">
            งานและข้อสอบที่ยังต้องจัดการ เรียงรายการเร่งด่วนไว้ก่อน
          </p>
        </div>
        <div className="grid gap-7 lg:grid-cols-2">
          <PendingAssignments
            rows={pendingAssignments}
            now={now}
            onAll={onAllAssignments}
          />
          <PendingExams
            rows={unfinishedExams}
            onTake={onTake}
            onResult={onResult}
            onAll={onAllExams}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex min-w-0 items-center justify-center gap-2 border-white/10 p-4 text-center lg:justify-start lg:border-b lg:px-6 lg:text-left last:border-0">
      <span className="hidden text-[#9fddc8] sm:block [&>svg]:size-5">
        {icon}
      </span>
      <div>
        <b className="block text-xl">{value}</b>
        <span className="block truncate text-[10px] text-white/55">
          {label}
        </span>
      </div>
    </div>
  );
}

function PendingAssignments({
  rows,
  now,
  onAll,
}: {
  rows: StudentAssignment[];
  now: number;
  onAll: () => void;
}) {
  return (
    <div>
      <SectionHeading
        icon={<NotebookPen size={17} />}
        title="งานที่ค้าง"
        count={rows.length}
        onAll={onAll}
      />
      {rows.length ? (
        <div className="divide-y divide-[#edf2ef] overflow-hidden rounded-lg border border-[#dce7e2] bg-white">
          {rows.slice(0, 4).map((row) => {
            const overdue = new Date(row.dueAt).getTime() < now;
            return (
              <button
                className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#f7faf8] sm:p-5"
                key={row.id}
                onClick={onAll}
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-lg ${overdue ? "bg-[#fee8e3] text-[#b94e3c]" : "bg-[#dff1ea] text-[#176b55]"}`}
                >
                  {overdue ? (
                    <AlertCircle size={19} />
                  ) : (
                    <CalendarClock size={19} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{row.title}</b>
                  <span className="mt-1 block truncate text-[10px] text-[#71847d]">
                    {row.subject.name} · {formatDueDate(row.dueAt)}
                  </span>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold ${overdue ? "text-[#b94e3c]" : "text-[#805e10]"}`}
                >
                  {row.status === "CLOSED"
                    ? "ปิดรับแล้ว"
                    : overdue
                      ? "เลยกำหนด"
                      : "รอส่ง"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="ไม่มีงานค้าง"
          text="งานที่ส่งแล้วจะไม่แสดงในรายงานนี้"
        />
      )}
    </div>
  );
}

function PendingExams({
  rows,
  onTake,
  onResult,
  onAll,
}: {
  rows: StudentExam[];
  onTake: (exam: StudentExam) => void;
  onResult: (id: string) => void;
  onAll: () => void;
}) {
  return (
    <div>
      <SectionHeading
        icon={<BookOpenCheck size={17} />}
        title="ข้อสอบที่ยังไม่ทำ"
        count={rows.length}
        onAll={onAll}
      />
      {rows.length ? (
        <div className="grid gap-3">
          {rows.slice(0, 2).map((exam) => (
            <ExamCard
              exam={exam}
              onTake={onTake}
              onResult={onResult}
              key={exam.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="ทำข้อสอบครบแล้ว"
          text="เมื่อครูเปิดข้อสอบชุดใหม่ รายการจะปรากฏที่นี่"
        />
      )}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  count,
  onAll,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  onAll: () => void;
}) {
  return (
    <div className="mb-3 flex h-9 items-center gap-2">
      <span className="text-[#176b55]">{icon}</span>
      <h3 className="text-sm font-bold">{title}</h3>
      <span className="rounded-md bg-[#e8efeb] px-2 py-0.5 text-[10px] font-bold text-[#526a62]">
        {count}
      </span>
      <button
        className="ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#176b55]"
        onClick={onAll}
      >
        ดูทั้งหมด <ArrowRight size={13} />
      </button>
    </div>
  );
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
