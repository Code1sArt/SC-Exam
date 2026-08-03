import {
  BookOpenCheck,
  ExternalLink,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  PlaygroundDifficulty,
  PlaygroundProblem,
} from "../../types/playground";

const levels: Array<{
  value: PlaygroundDifficulty;
  label: string;
  subtitle: string;
  dotClass: string;
}> = [
  { value: "EASY", label: "ง่าย", subtitle: "เริ่มจากพื้นฐาน", dotClass: "bg-emerald-500" },
  { value: "MEDIUM", label: "กลาง", subtitle: "ฝึกคิดหลายขั้นตอน", dotClass: "bg-amber-500" },
  { value: "HARD", label: "ยาก", subtitle: "ท้าทายความสามารถ", dotClass: "bg-rose-500" },
];

export function PlaygroundProblemLibrary({
  onLoad,
}: {
  onLoad: () => Promise<PlaygroundProblem[]>;
}) {
  const [rows, setRows] = useState<PlaygroundProblem[]>([]);
  const [activeLevel, setActiveLevel] = useState<PlaygroundDifficulty>("EASY");
  const [preview, setPreview] = useState<PlaygroundProblem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    onLoad()
      .then((problems) => {
        if (ignore) return;
        setRows(problems);
        const firstAvailable = levels.find((level) =>
          problems.some((problem) => problem.difficulty === level.value),
        );
        if (firstAvailable) setActiveLevel(firstAvailable.value);
      })
      .catch((caught) => {
        if (!ignore)
          setError(caught instanceof Error ? caught.message : "โหลดโจทย์ไม่สำเร็จ");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [onLoad]);

  const grouped = useMemo(
    () =>
      Object.fromEntries(
        levels.map((level) => [
          level.value,
          rows
            .filter((row) => row.difficulty === level.value)
            .sort((a, b) => a.position - b.position),
        ]),
      ) as Record<PlaygroundDifficulty, PlaygroundProblem[]>,
    [rows],
  );

  if (loading)
    return (
      <section className="grid min-h-40 place-items-center rounded-xl border border-[#dce7e2] bg-white text-xs text-[#71847c]">
        <span className="flex items-center gap-2"><LoaderCircle className="animate-spin" size={17} /> กำลังโหลดคลังโจทย์...</span>
      </section>
    );

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-[#dce7e2] bg-white shadow-[0_8px_28px_rgba(24,50,45,.04)]">
        <header className="flex flex-col gap-4 border-b border-[#e8efec] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e1f3eb] text-[#176b55]"><BookOpenCheck size={20} /></span>
            <div><h2 className="text-sm font-bold text-[#263d36]">เลือกโจทย์ฝึกเขียนโปรแกรม</h2><p className="mt-1 text-[10px] text-[#7c8f87]">เปิดอ่านโจทย์ แล้วลงมือเขียนโค้ดใน Playground ด้านล่าง</p></div>
          </div>
          <span className="rounded-full bg-[#f0f5f3] px-3 py-1.5 text-[10px] font-bold text-[#60756d]">ทั้งหมด {rows.length} โจทย์</span>
        </header>

        <div className="grid grid-cols-3 border-b border-[#e8efec] bg-[#f8faf9] p-2 sm:gap-2">
          {levels.map((level) => (
            <button
              key={level.value}
              className={`rounded-lg px-2 py-3 text-left transition sm:px-4 ${activeLevel === level.value ? "bg-white shadow-[0_2px_10px_rgba(28,61,51,.08)] ring-1 ring-[#dce7e2]" : "hover:bg-white/70"}`}
              onClick={() => setActiveLevel(level.value)}
            >
              <div className="flex items-center gap-2"><i className={`size-2 rounded-full ${level.dotClass}`} /><b className="text-xs text-[#31473f]">{level.label}</b><span className="ml-auto text-[9px] font-bold text-[#81928c]">{grouped[level.value].length}</span></div>
              <p className="mt-1 hidden text-[9px] text-[#8a9994] sm:block">{level.subtitle}</p>
            </button>
          ))}
        </div>

        {error ? (
          <div className="p-8 text-center text-xs text-[#c05a62]">{error}</div>
        ) : grouped[activeLevel].length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {grouped[activeLevel].map((problem, index) => (
              <article key={problem.id} className="group flex min-h-40 flex-col rounded-xl border border-[#dfe8e4] p-4 transition hover:-translate-y-0.5 hover:border-[#9bcbb9] hover:shadow-[0_8px_22px_rgba(24,77,60,.08)]">
                <div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#f0f5f3] text-[10px] font-black text-[#557067]">{String(index + 1).padStart(2, "0")}</span><div><h3 className="line-clamp-2 text-xs font-bold leading-5 text-[#2c4039]">{problem.title}</h3><span className="mt-1 inline-block text-[9px] font-bold text-[#278064]">ระดับ{levels.find((level) => level.value === activeLevel)?.label}</span></div></div>
                <p className="mt-3 line-clamp-2 text-[10px] leading-5 text-[#7a8d86]">{problem.description || "เปิดดูรายละเอียดโจทย์จากไฟล์ที่แนบไว้"}</p>
                <button className="mt-auto inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#e7f4ef] text-[10px] font-bold text-[#176b55] transition group-hover:bg-[#238568] group-hover:text-white" onClick={() => setPreview(problem)}><FileText size={14} /> เปิดดูโจทย์</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-44 place-items-center p-8 text-center"><div><FileText className="mx-auto text-[#a9b7b2]" size={30} /><p className="mt-3 text-xs font-bold text-[#62766f]">ยังไม่มีโจทย์ระดับ{levels.find((level) => level.value === activeLevel)?.label}</p><span className="mt-1 block text-[10px] text-[#94a39e]">ลองเลือกระดับอื่นก่อนได้เลย</span></div></div>
        )}
      </section>

      {preview && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-[#12211dd9] p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPreview(null)}>
          <section className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center gap-3 border-b border-[#dce7e2] px-4 py-3 sm:px-5"><span className="rounded-full bg-[#e1f3eb] px-3 py-1 text-[9px] font-bold text-[#176b55]">ระดับ{levels.find((level) => level.value === preview.difficulty)?.label}</span><h2 className="min-w-0 flex-1 truncate text-xs font-bold text-[#2c4039] sm:text-sm">{preview.title}</h2><a className="hidden items-center gap-1.5 rounded-lg border border-[#d8e3df] px-3 py-2 text-[9px] font-bold text-[#48665c] sm:inline-flex" href={preview.driveUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /> เปิดใน Drive</a><button className="grid size-8 place-items-center rounded-lg text-[#657a72] hover:bg-[#edf3f0]" onClick={() => setPreview(null)} aria-label="ปิดพรีวิว"><X size={18} /></button></header>
            <iframe className="min-h-0 flex-1 bg-[#edf1ef]" src={preview.previewUrl} title={`โจทย์ ${preview.title}`} allow="autoplay" />
            <footer className="flex items-center justify-between border-t border-[#dce7e2] bg-[#f8faf9] px-4 py-2.5"><span className="text-[9px] text-[#82938d]">หากไม่เห็นไฟล์ ให้แจ้งครูตรวจสิทธิ์แชร์ Google Drive</span><a className="text-[9px] font-bold text-[#197359] sm:hidden" href={preview.driveUrl} target="_blank" rel="noreferrer">เปิดใน Drive</a></footer>
          </section>
        </div>
      )}
    </>
  );
}
