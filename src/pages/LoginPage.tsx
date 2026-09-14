import {
  ArrowRight,
  BookOpenCheck,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import casinoTeacher from "../assets/edu-casino-teacher.png";

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

function Brand() {
  return (
    <div className="casino-brand">
      <span className="casino-brand-logo">
        <img src="/lab-edu-logo.png" alt="" />
      </span>
      <span>
        <b>LAB EDU</b>
        <small>LEARN • LEVEL UP • WIN</small>
      </span>
    </div>
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
    <label className="casino-field" htmlFor={id}>
      <span className="casino-field-label">{label}</span>
      <span className="casino-input-wrap">
        <span className="casino-input-icon">{icon}</span>
        <input
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
            className="casino-password-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </span>
    </label>
  );
}

function LoginHero() {
  return (
    <section className="casino-hero" aria-label="โปรโมชั่นการเรียน">
      <img
        className="casino-hero-image"
        src={casinoTeacher}
        alt="ผู้สอนในฉากคาสิโนสีทองสำหรับแคมเปญการศึกษา"
      />
      <div className="casino-hero-shade" />
      <span className="casino-spark casino-spark-one" aria-hidden="true">✦</span>
      <span className="casino-spark casino-spark-two" aria-hidden="true">✦</span>
      <span className="casino-chip casino-chip-red" aria-hidden="true">A+</span>
      <span className="casino-chip casino-chip-black" aria-hidden="true">100</span>

      <div className="casino-hero-top">
        <Brand />
        <span className="casino-live-pill"><i /> ระบบพร้อมเรียน</span>
      </div>

      <div className="casino-hero-copy">
        <div className="casino-eyebrow"><Sparkles size={15} /> โบนัสต้อนรับเด็กขยัน</div>
        <h1>
          แจ็กพอตความรู้
          <span>โบนัสข้อสอบฟรี</span>
          สำหรับสายขยัน!
        </h1>
        <p>เข้าเรียนวันนี้ รับพลังสมอง <strong>x2</strong></p>
        <div className="casino-feature-row">
          <span><BookOpenCheck size={16} /> ฝากโจทย์</span>
          <i>→</i>
          <span><Trophy size={16} /> ถอนเกรด</span>
        </div>
      </div>

      <div className="casino-disclaimer">
        <ShieldCheck size={17} />
        <span><b>ไม่ใช่เว็บพนัน</b> แต่เป็นเว็บปั้นอนาคต</span>
      </div>
    </section>
  );
}

function LoginForm({ loading, onLogin }: LoginPageProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onLogin(String(formData.get("identifier")), String(formData.get("password")));
  };

  return (
    <section className="casino-login-panel">
      <div className="casino-mobile-brand"><Brand /></div>

      <form className="casino-login-card" onSubmit={submit}>
        <div className="casino-card-kicker">
          <span><GraduationCap size={18} /></span>
          STUDENT MEMBER
        </div>

        <h2>ล็อกอิน แล้วลุยเลย!</h2>
        <p className="casino-card-subtitle">โต๊ะเรียนเปิดแล้ว พร้อมโกยความรู้กลับบ้านหรือยัง?</p>

        <div className="casino-reward-banner">
          <span className="casino-reward-icon"><Zap size={22} fill="currentColor" /></span>
          <span><small>สิทธิพิเศษวันนี้</small><b>รับพลังสมอง x2</b></span>
          <strong>FREE</strong>
        </div>

        <div className="casino-fields">
          <LoginField
            id="identifier"
            label="รหัสประจำตัวนักเรียน"
            icon={<UserRound size={18} aria-hidden="true" />}
            autoComplete="username"
            placeholder="เช่น 25484"
          />
          <LoginField
            id="password"
            label="รหัสผ่าน"
            icon={<LockKeyhole size={18} aria-hidden="true" />}
            type="password"
            autoComplete="current-password"
            minLength={8}
            placeholder="กรอกรหัสผ่าน"
          />
        </div>

        <button
          className="casino-submit"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            "กำลังพาเข้าสู่ห้องเรียน..."
          ) : (
            <>
              <span>เข้าเรียน รับโบนัสเลย</span>
              <ArrowRight size={20} aria-hidden="true" />
            </>
          )}
        </button>

        <div className="casino-trust-row">
          <span><ShieldCheck size={14} /> ปลอดภัย</span>
          <span><Zap size={14} /> เข้าเรียนไว</span>
          <span><Trophy size={14} /> วัดผลจริง</span>
        </div>

        <p className="casino-fine-print">
          เว็บไซต์เพื่อการศึกษาเท่านั้น • ไม่มีการเดิมพัน • ไม่มีการใช้เงินจริง
        </p>
      </form>

      <footer className="casino-footer">
        <span>© 2026 LAB EDU</span>
        <span>เดิมพันด้วยความขยัน กำไรคืออนาคต</span>
      </footer>
    </section>
  );
}

export function LoginPage({ loading, onLogin }: LoginPageProps) {
  return (
    <main className="casino-login-page">
      <div className="casino-marquee" aria-label="ข้อความประชาสัมพันธ์">
        <div>
          <span>★ โบนัสข้อสอบฟรีสำหรับสายขยัน</span>
          <span>ฝากโจทย์ • ถอนเกรด</span>
          <span>เข้าเรียนวันนี้ รับพลังสมอง x2</span>
          <span>ไม่ใช่เว็บพนัน แต่เป็นเว็บปั้นอนาคต ★</span>
        </div>
      </div>
      <div className="casino-login-grid">
        <LoginHero />
        <LoginForm loading={loading} onLogin={onLogin} />
      </div>
    </main>
  );
}
