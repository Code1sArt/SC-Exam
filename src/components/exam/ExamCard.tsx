import { ArrowRight, CheckCircle2, Clock3, LockKeyhole, Play, RotateCcw } from "lucide-react";
import type { StudentExam } from "../../types/exam";

const subjectColors = ["bg-[#dff1ea] text-[#176b55]", "bg-[#e4effa] text-[#315f86]", "bg-[#fff0c8] text-[#805e10]", "bg-[#fee8e3] text-[#a34b3b]"];

export function ExamCard({ exam, onTake, onResult }: { exam: StudentExam; onTake: (exam: StudentExam) => void; onResult: (id: string) => void }) {
  const active = exam.attempts.find((item) => item.status === "IN_PROGRESS");
  const completed = [...exam.attempts].reverse().find((item) => item.status === "GRADED");
  const now = Date.now();
  const unavailable = (exam.availableFrom ? new Date(exam.availableFrom).getTime() > now : false) || (exam.availableUntil ? new Date(exam.availableUntil).getTime() < now : false);
  const canTake = exam.status === "PUBLISHED" && !unavailable && (Boolean(active) || exam.attempts.length < exam.maxAttempts);
  const tone = subjectColors[exam.subject.name.length % subjectColors.length];

  return <article className="exam-card flex min-h-52 flex-col rounded-lg border border-[#dce7e2] bg-white p-5 transition hover:border-[#a9c9bd] hover:shadow-[0_12px_32px_rgba(24,50,45,.08)] sm:p-6">
    <div className="flex items-start justify-between gap-3"><span className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${tone}`}>{exam.subject.name}</span>{active?.lockedAt ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#b94e3c]"><LockKeyhole size={13} />ถูกล็อก</span> : active ? <span className="text-[10px] font-bold text-[#c56c19]">กำลังทำ</span> : completed ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#176b55]"><CheckCircle2 size={13} />ทำแล้ว</span> : null}</div>
    <h3 className="mt-4 text-base font-bold leading-7 text-[#18322d]">{exam.title}</h3><p className="mt-1.5 line-clamp-2 text-xs leading-6 text-[#71847d]">{exam.description || `แบบทดสอบสำหรับห้อง ${exam.classroom.name}`}</p>
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#62766f]"><span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{exam.durationMinutes ? `${exam.durationMinutes} นาที` : "ไม่จำกัดเวลา"}</span><span>{exam._count.items} ข้อ</span><span className="inline-flex items-center gap-1.5"><RotateCcw size={13} />ทำได้ {exam.maxAttempts} ครั้ง</span></div>
    <footer className="mt-auto flex items-end justify-between gap-3 border-t border-[#edf2ef] pt-4"><div>{completed ? <><b className="block text-xl text-[#176b55]">{Number(completed.percentage ?? 0).toFixed(0)}%</b><span className="text-[10px] text-[#879890]">คะแนนล่าสุด</span></> : <><b className={`block text-xs ${active?.lockedAt ? "text-[#b94e3c]" : "text-[#415b53]"}`}>{active?.lockedAt ? "รอครูปลดล็อก" : active ? `ทำต่อครั้งที่ ${active.attemptNumber}` : "พร้อมเริ่มทำ"}</b><span className="text-[10px] text-[#879890]">เหลือ {Math.max(0, exam.maxAttempts - exam.attempts.length)} ครั้ง</span></>}</div>{canTake ? <button className={active?.lockedAt ? "student-button-secondary" : "student-button-primary"} onClick={() => onTake(exam)}>{active?.lockedAt ? <LockKeyhole size={15} /> : active ? <ArrowRight size={15} /> : <Play size={15} />}{active?.lockedAt ? "ดูสถานะ" : active ? "ทำต่อ" : "เริ่มทำ"}</button> : completed ? <button className="student-button-secondary" onClick={() => onResult(completed.id)}>ดูผล</button> : <span className="rounded-md bg-[#edf2ef] px-3 py-2 text-[10px] font-bold text-[#879890]">ยังไม่เปิด</span>}</footer>
  </article>;
}
