import { Sparkles } from "lucide-react";
import type { StudentAiStatus } from "../../services/ai.service";

const states = {
  AVAILABLE: { label: "AI พร้อมใช้งาน", short: "AI พร้อม", classes: "border-[#b9dfd0] bg-[#eff8f4] text-[#176b55]", dot: "bg-[#238568]" },
  DEGRADED: { label: "AI บางส่วนขัดข้อง", short: "AI ขัดข้อง", classes: "border-[#f0d493] bg-[#fff9e9] text-[#9a651a]", dot: "bg-[#d18a27]" },
  UNAVAILABLE: { label: "AI ไม่พร้อมใช้งาน", short: "AI ไม่พร้อม", classes: "border-[#efc0b8] bg-[#fff1ee] text-[#a94737]", dot: "bg-[#cf6857]" },
  MOCK: { label: "AI อยู่ในโหมดจำลอง", short: "AI จำลอง", classes: "border-[#cbd7e5] bg-[#f1f5fa] text-[#315f86]", dot: "bg-[#6689a8]" },
  DISABLED: { label: "โรงเรียนปิด AI", short: "AI ปิดอยู่", classes: "border-[#d7dce2] bg-[#f3f5f7] text-[#65717d]", dot: "bg-[#98a1aa]" },
} as const;

export function AiStatusBadge({ status, compact = false }: { status: StudentAiStatus | null; compact?: boolean }) {
  if (!status) return <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#dce7e2] bg-white px-2.5 text-[10px] font-semibold text-[#71847d]" title="กำลังตรวจสอบการเชื่อมต่อ AI"><span className="size-1.5 animate-pulse rounded-full bg-[#9aa9a3]" />AI กำลังตรวจ</span>;
  const state = states[status.status];
  const details = status.status === "DISABLED" ? "ผู้ดูแลโรงเรียนปิด AI สำหรับผู้เรียน" : `ตรวจคำตอบ: ${status.feedback ? "พร้อม" : "ขัดข้อง"} · รายงานผล: ${status.report ? "พร้อม" : "ขัดข้อง"}`;
  return <span className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-semibold ${state.classes}`} title={details}><Sparkles size={13} /><span>{compact ? state.short : state.label}</span><span className={`size-1.5 rounded-full ${state.dot}`} /></span>;
}
