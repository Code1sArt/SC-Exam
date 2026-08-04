import {
  BarChart3,
  BookOpenCheck,
  ChevronDown,
  Home,
  LogOut,
  NotebookPen,
  Code2,
  Braces,
  Settings,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type { StudentProfile } from "../../types/auth";
import type { PageKey } from "../../types/exam";
import type { StudentAiStatus } from "../../services/ai.service";
import { AiStatusBadge } from "../ui/AiStatusBadge";
import { AppFooter } from "./AppFooter";

const navigation = [
  { key: "dashboard" as const, label: "วันนี้", mobileLabel: "วันนี้", icon: Home },
  { key: "exams" as const, label: "แบบทดสอบ", mobileLabel: "ข้อสอบ", icon: BookOpenCheck },
  { key: "assignments" as const, label: "งาน", mobileLabel: "งาน", icon: NotebookPen },
  { key: "results" as const, label: "ผลการเรียน", mobileLabel: "ผลเรียน", icon: BarChart3 },
  { key: "settings" as const, label: "บัญชี", mobileLabel: "บัญชี", icon: Settings },
];

const codeNavigation = [
  { key: "coding-tests" as const, label: "Coding Test", description: "ทำข้อสอบเขียนโค้ด", icon: Braces },
  { key: "playground" as const, label: "Playground", description: "ทดลองเขียนและรันโค้ด", icon: Code2 },
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
  const [codeMenuOpen, setCodeMenuOpen] = useState(false);
  const codeActive = page === "coding-tests" || page === "playground";
  const visibleCodeNavigation = codeNavigation.filter(
    (item) => item.key !== "playground" || playgroundEnabled,
  );

  useEffect(() => {
    if (!codeMenuOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        !event.target.closest("[data-code-menu]")
      ) {
        setCodeMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCodeMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [codeMenuOpen]);

  const goToPage = (nextPage: PageKey) => {
    setCodeMenuOpen(false);
    onPage(nextPage);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f8f6] text-[#18322d]">
      <header className="sticky top-0 z-30 border-b border-[#dce7e2] bg-[#f5f8f6]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:h-18 lg:gap-6">
          <button
            className="flex shrink-0 items-center gap-2.5"
            onClick={() => onPage("dashboard")}
            aria-label="ไปหน้าหลัก"
          >
            <img className="size-9 object-contain" src="/lab-edu-logo.png" alt="" />
            <span className="hidden text-base font-bold sm:block">Lab EDU</span>
          </button>
          <nav className="mx-auto hidden h-full items-center gap-0.5 lg:flex">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              return (
                <div className="contents" key={item.key}>
                  <button
                    onClick={() => goToPage(item.key)}
                    className={`relative flex h-full items-center gap-1.5 px-2.5 text-xs font-semibold transition xl:px-3.5 ${page === item.key ? "text-[#176b55]" : "text-[#62766f] hover:text-[#18322d]"}`}
                    title={item.label}
                  >
                    <Icon size={17} />
                    {item.label}
                    {page === item.key && (
                      <span className="absolute inset-x-2.5 bottom-0 h-0.5 bg-[#176b55] xl:inset-x-3.5" />
                    )}
                  </button>
                  {index === 1 && (
                    <div className="relative h-full" data-code-menu>
                      <button
                        className={`relative flex h-full items-center gap-1.5 px-2.5 text-xs font-semibold transition xl:px-3.5 ${codeActive ? "text-[#176b55]" : "text-[#62766f] hover:text-[#18322d]"}`}
                        onClick={() => setCodeMenuOpen((open) => !open)}
                        aria-expanded={codeMenuOpen}
                        aria-haspopup="menu"
                      >
                        <Code2 size={17} />
                        Code
                        <ChevronDown
                          size={13}
                          className={`transition-transform ${codeMenuOpen ? "rotate-180" : ""}`}
                        />
                        {codeActive && (
                          <span className="absolute inset-x-2.5 bottom-0 h-0.5 bg-[#176b55] xl:inset-x-3.5" />
                        )}
                      </button>
                      {codeMenuOpen && (
                        <div className="absolute left-1/2 top-[calc(100%-4px)] z-50 w-56 -translate-x-1/2 rounded-xl border border-[#dce7e2] bg-white p-1.5 shadow-[0_16px_40px_rgba(24,50,45,0.16)]" role="menu">
                          {visibleCodeNavigation.map((codeItem) => {
                            const CodeIcon = codeItem.icon;
                            return (
                              <button
                                key={codeItem.key}
                                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${page === codeItem.key ? "bg-[#e8f4ef] text-[#176b55]" : "text-[#3f5951] hover:bg-[#f5f8f6]"}`}
                                onClick={() => goToPage(codeItem.key)}
                                role="menuitem"
                              >
                                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${page === codeItem.key ? "bg-[#d9efe5]" : "bg-[#edf2f0]"}`}>
                                  <CodeIcon size={16} />
                                </span>
                                <span>
                                  <b className="block text-xs">{codeItem.label}</b>
                                  <small className="mt-0.5 block text-[10px] font-normal text-[#71847d]">{codeItem.description}</small>
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <AiStatusBadge status={aiStatus} compact />
            <div className="hidden text-right xl:block">
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-7 sm:px-6 sm:pt-9 lg:pb-14">
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
      <div className="pb-18 lg:pb-0"><AppFooter /></div>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-18 grid-cols-6 border-t border-[#dce7e2] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          return (
            <div className="contents" key={item.key}>
              <button
                onClick={() => goToPage(item.key)}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${page === item.key ? "text-[#176b55]" : "text-[#71847d]"}`}
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg ${page === item.key ? "bg-[#d9efe5]" : ""}`}
                >
                  <Icon size={18} />
                </span>
                <span className="truncate">{item.mobileLabel}</span>
              </button>
              {index === 1 && (
                <div className="relative min-w-0" data-code-menu>
                  <button
                    className={`flex h-full w-full min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${codeActive ? "text-[#176b55]" : "text-[#71847d]"}`}
                    onClick={() => setCodeMenuOpen((open) => !open)}
                    aria-expanded={codeMenuOpen}
                    aria-haspopup="menu"
                  >
                    <span className={`grid size-8 place-items-center rounded-lg ${codeActive ? "bg-[#d9efe5]" : ""}`}>
                      <Code2 size={18} />
                    </span>
                    <span className="flex items-center gap-0.5">Code <ChevronDown size={10} /></span>
                  </button>
                  {codeMenuOpen && (
                    <div className="absolute bottom-[calc(100%+10px)] left-1/2 z-50 w-52 -translate-x-1/2 rounded-xl border border-[#dce7e2] bg-white p-1.5 shadow-[0_12px_36px_rgba(24,50,45,0.2)]" role="menu">
                      {visibleCodeNavigation.map((codeItem) => {
                        const CodeIcon = codeItem.icon;
                        return (
                          <button
                            key={codeItem.key}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${page === codeItem.key ? "bg-[#e8f4ef] text-[#176b55]" : "text-[#3f5951]"}`}
                            onClick={() => goToPage(codeItem.key)}
                            role="menuitem"
                          >
                            <CodeIcon size={17} />
                            <span className="text-xs font-bold">{codeItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
