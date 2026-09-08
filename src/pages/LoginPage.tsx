import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import bannerImage from "../assets/student-login-banner.png";
import capybaraRunning from "../assets/capybara-running.png";
import { AppFooter } from "../components/layout/AppFooter";

type LoginPageProps = {
  loading: boolean;
  onLogin: (identifier: string, password: string) => void;
};

type LoginFieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  type?: "text" | "password";
  placeholder: string;
  autoComplete: string;
  minLength?: number;
};

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid place-items-center rounded-xl bg-white shadow-sm ${
          compact ? "size-11 p-1.5" : "size-10 p-1 shadow-lg shadow-[#00272c]/20"
        }`}
      >
        <img className="size-full object-contain" src="/lab-edu-logo.png" alt="" />
      </span>
      <b className={`text-lg ${compact ? "text-[#18322d]" : "text-white"}`}>
        Lab EDU
      </b>
    </div>
  );
}

function LoginHero() {
  return (
    <section className="login-hero relative hidden min-h-screen overflow-hidden lg:block">
      <img
        src={bannerImage}
        alt="ครูคอมพิวเตอร์ในชุดซูเปอร์ฮีโร่ถือแล็ปท็อป"
        className="absolute inset-0 size-full object-cover object-[58%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,39,44,.84)_0%,rgba(0,50,56,.56)_46%,rgba(0,50,56,.08)_72%,rgba(0,50,56,.02)_100%)]" />

      <span className="login-orb login-orb-one" />
      <span className="login-orb login-orb-two" />
      <span className="login-star login-star-one">✦</span>
      <span className="login-star login-star-two">✦</span>

      <div className="relative flex h-full max-w-xl flex-col p-12 text-white xl:p-16">
        <Brand />

        <div className="my-auto max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#d5fff0] backdrop-blur-sm">
            <Sparkles size={13} />
            LEARNING FOR THE FUTURE
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.35] xl:text-5xl">
            Lab EDU
            <br />
            การศึกษายุคใหม่
            <br />
            กับครู (Gen) Y
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
            พื้นที่เรียนรู้และทำข้อสอบที่ช่วยให้ทุกก้าวของนักเรียนชัดเจนขึ้น
          </p>
        </div>

        <p className="text-xs text-white/70">
          เรียนรู้จากทุกคำตอบ ไม่ใช่แค่คะแนนปลายทาง
        </p>
      </div>
    </section>
  );
}

function LoginField({
  id,
  label,
  icon,
  type = "text",
  placeholder,
  autoComplete,
  minLength,
}: LoginFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="login-field block text-xs font-semibold text-[#415b53]" htmlFor={id}>
      {label}
      <span className="login-input-wrap mt-2">
        {icon}
        <input
          className="student-input"
          id={id}
          name={id}
          type={isPassword && showPassword ? "text" : type}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            className="login-password-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPassword ? "ซ่อน" : "แสดง"}
          </button>
        )}
      </span>
    </label>
  );
}

function LoginForm({ loading, onLogin }: LoginPageProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    onLogin(
      String(formData.get("identifier")),
      String(formData.get("password")),
    );
  };

  return (
    <form className="login-card m-auto w-full max-w-sm" onSubmit={submit}>
      <div className="mb-9 lg:hidden">
        <Brand compact />
        <p className="mt-3 text-xs font-semibold leading-5 text-[#237b63]">
          การศึกษายุคใหม่ กับครู (Gen) Y
        </p>
      </div>

      <div className="login-welcome-icon" aria-hidden="true">
        <Sparkles size={22} />
      </div>
      <span className="mt-5 inline-flex rounded-full bg-[#e5f6ee] px-3 py-1 text-xs font-bold text-[#237b63]">
        สำหรับนักเรียน
      </span>
      <h2 className="mt-3 text-3xl font-bold text-[#18322d]">
        กลับมาเรียนรู้กันต่อ <span className="inline-block animate-[bounce_1.8s_infinite]">👋</span>
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#71847d]">
        เข้าสู่ระบบเพื่อดูแบบทดสอบที่ได้รับมอบหมาย
      </p>

      <div className="mt-8 space-y-5">
        <LoginField
          id="identifier"
          label="รหัสประจำตัวนักเรียน"
          icon={<UserRound size={17} aria-hidden="true" />}
          autoComplete="username"
          placeholder="เช่น 25484"
        />
        <LoginField
          id="password"
          label="รหัสผ่าน"
          icon={<LockKeyhole size={17} aria-hidden="true" />}
          type="password"
          autoComplete="current-password"
          minLength={8}
          placeholder="กรอกรหัสผ่าน"
        />
      </div>

      <button
        className="student-button-primary login-submit mt-7 h-12 w-full text-sm"
        type="submit"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          "กำลังเข้าสู่ระบบ..."
        ) : (
          <>
            <span>เข้าสู่ระบบ</span>
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>

      <div className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] text-[#879890]">
        <ShieldCheck size={15} className="shrink-0 text-[#4b9f80]" aria-hidden="true" />
        <span>ข้อมูลการทำข้อสอบของคุณถูกเก็บอย่างปลอดภัย</span>
      </div>
    </form>
  );
}

export function LoginPage({ loading, onLogin }: LoginPageProps) {
  return (
    <main className="login-page grid min-h-screen overflow-hidden bg-[#f7faf8] lg:grid-cols-[1.08fr_.92fr]">
      <LoginHero />

      <section className="login-panel relative flex min-h-screen flex-col px-6 py-10 sm:px-10">
        <span className="login-doodle login-doodle-one" aria-hidden="true">✿</span>
        <span className="login-doodle login-doodle-two" aria-hidden="true">✦</span>
        <div className="login-capybara" aria-hidden="true">
          <span className="login-capybara-shadow" />
          <img src={capybaraRunning} alt="" />
        </div>

        <LoginForm loading={loading} onLogin={onLogin} />
        <AppFooter />
      </section>
    </main>
  );
}
