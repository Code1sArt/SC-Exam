import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { ExamCard } from "../components/exam/ExamCard";
import { EmptyState } from "../components/ui/StateViews";
import type { StudentExam } from "../types/exam";

export function ExamsPage({ exams, onTake, onResult }: { exams: StudentExam[]; onTake: (exam: StudentExam) => void; onResult: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "active" | "completed">("all");
  const counts = useMemo(
    () => ({
      all: exams.length,
      active: exams.filter((exam) => exam.attempts.some((attempt) => attempt.status === "IN_PROGRESS") || !exam.attempts.length).length,
      completed: exams.filter((exam) => exam.attempts.some((attempt) => attempt.status === "GRADED")).length,
    }),
    [exams],
  );
  const rows = useMemo(
    () =>
      exams
        .filter((exam) => `${exam.title} ${exam.subject.name} ${exam.classroom.name}`.toLocaleLowerCase("th-TH").includes(search.toLocaleLowerCase("th-TH")))
        .filter((exam) =>
          tab === "all" ? true : tab === "active" ? exam.attempts.some((a) => a.status === "IN_PROGRESS") || !exam.attempts.length : exam.attempts.some((a) => a.status === "GRADED"),
        ),
    [exams, search, tab],
  );

  const tabs = [
    { key: "all" as const, label: "ทั้งหมด", count: counts.all, activeClass: "bg-white text-[#18322d] shadow-sm", countClass: "text-[#526a62]" },
    { key: "active" as const, label: "ต้องทำ", count: counts.active, activeClass: "bg-white text-[#b94e3c] shadow-sm", countClass: "text-[#b94e3c]" },
    { key: "completed" as const, label: "ทำแล้ว", count: counts.completed, activeClass: "bg-white text-[#176b55] shadow-sm", countClass: "text-[#176b55]" },
  ];

  return <div><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="inline-flex self-start rounded-lg bg-[#e8efeb] p-1">{tabs.map((item) => <button key={item.key} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition ${tab === item.key ? item.activeClass : "text-[#71847d] hover:text-[#415b53]"}`} onClick={() => setTab(item.key)}><span>{item.label}</span><span className={tab === item.key ? item.countClass : item.countClass}>{item.count}</span></button>)}</div><label className="flex h-11 items-center gap-2 rounded-lg border border-[#dce7e2] bg-white px-4 text-[#879890] sm:w-72"><Search size={17} /><input className="w-full border-0 bg-transparent text-xs text-[#18322d] outline-none" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อหรือวิชา" /></label></div>{rows.length ? <div className="grid gap-3 lg:grid-cols-2">{rows.map((exam) => <ExamCard key={exam.id} exam={exam} onTake={onTake} onResult={onResult} />)}</div> : <EmptyState title="ไม่พบแบบทดสอบ" text="ลองเปลี่ยนตัวกรองหรือค้นหาด้วยชื่อวิชาอื่น" />}</div>;
}
