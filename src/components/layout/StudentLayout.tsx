import {
  BarChart3,
  BookOpenCheck,
  Home,
  LogOut,
  NotebookPen,
  Code2,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import type { StudentProfile } from "../../types/auth";
import type { PageKey } from "../../types/exam";
import type { StudentAiStatus } from "../../services/ai.service";
import { AiStatusBadge } from "../ui/AiStatusBadge";
import { AppFooter } from "./AppFooter";

const navigation = [
  { key: "dashboard" as const, label: "วันนี้", icon: Home },
  { key: "exams" as const, label: "แบบทดสอบ", icon: BookOpenCheck },
  { key: "assignments" as const, label: "งาน", icon: NotebookPen },
  { key: "playground" as const, label: "Playground", icon: Code2 },
  { key: "results" as const, label: "ผลการเรียน", icon: BarChart3 },
  { key: "settings" as const, label: "บัญชี", icon: Settings },
];

export function StudentLayout({
  profile,
  page,
  aiStatus,
  title,
  subtitle,
  onPage,
  onLogout,
  playgroundEnabled,
  children,
}: {
  profile: StudentProfile;
  page: PageKey;
  aiStatus: StudentAiStatus | null;
  mobileOpen: boolean;
  title: string;
  subtitle: string;
  onPage: (page: PageKey) => void;
  onMobile: (value: boolean) => void;
  onLogout: () => void;
  playgroundEnabled: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8f6] text-[#18322d]">
      <header className="sticky top-0 z-30 border-b border-[#dce7e2] bg-[#f5f8f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6 lg:h-18">
          <button
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => onPage("dashboard")}
            aria-label="ไปหน้าหลัก"
          >
            <img className="size-9 object-contain" src="/lab-edu-logo.png" alt="" />
            <span className="hidden text-base font-bold sm:block">Lab EDU</span>
          </button>
          <nav className="mx-auto hidden h-full items-center gap-1 md:flex">
            {navigation.filter((item) => item.key !== "playground" || playgroundEnabled).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onPage(item.key)}
                  className={`relative flex h-full items-center gap-2 px-4 text-xs font-semibold transition ${page === item.key ? "text-[#176b55]" : "text-[#62766f] hover:text-[#18322d]"}`}
                >
                  <Icon size={17} />
                  {item.label}
                  {page === item.key && (
                    <span className="absolute inset-x-4 bottom-0 h-0.5 bg-[#176b55]" />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <AiStatusBadge status={aiStatus} compact />
            <div className="hidden text-right sm:block">
              <b className="block max-w-40 truncate text-xs">
                {profile.firstName} {profile.lastName}
              </b>
              <span className="block max-w-40 truncate text-[10px] text-[#71847d]">
                {profile.organization.name}
              </span>
            </div>
            <span className="grid size-9 place-items-center rounded-full bg-[#d9efe5] text-xs font-bold text-[#176b55]">
              {profile.firstName[0]}
            </span>
            <button
              className="grid size-9 place-items-center rounded-lg text-[#71847d] transition hover:bg-[#fee9e4] hover:text-[#bd4b3a]"
              onClick={onLogout}
              aria-label="ออกจากระบบ"
              title="ออกจากระบบ"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-7 sm:px-6 sm:pt-9 md:pb-14">
        <div className="mb-7">
          <h1 className="text-2xl font-bold leading-tight text-[#18322d] sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 text-xs leading-6 text-[#71847d] sm:text-sm">
            {subtitle}
          </p>
        </div>
        {children}
      </main>
      <div className="pb-18 md:pb-0"><AppFooter /></div>
      <nav className={`fixed inset-x-0 bottom-0 z-40 grid h-18 ${playgroundEnabled ? "grid-cols-6" : "grid-cols-5"} border-t border-[#dce7e2] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden`}>
        {navigation.filter((item) => item.key !== "playground" || playgroundEnabled).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => onPage(item.key)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${page === item.key ? "text-[#176b55]" : "text-[#71847d]"}`}
            >
              <span
                className={`grid size-8 place-items-center rounded-lg ${page === item.key ? "bg-[#d9efe5]" : ""}`}
              >
                <Icon size={18} />
              </span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
