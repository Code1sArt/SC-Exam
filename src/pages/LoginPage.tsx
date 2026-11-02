import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardCheck,
  Eye,
  EyeOff,
  GraduationCap,
  Heart,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import learningInspiration from "../assets/learning-inspiration.jpg";

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
    <div className="learning-brand">
      <span className="learning-brand-logo">
        <img src="/lab-edu-logo.png" alt="" width="44" height="44" />
      </span>
      <span>
        <b>LAB <span>EDU</span></b>
        <small>พื้นที่แห่งการเรียนรู้และเติบโต</small>
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
    <div className="learning-field">
      <label htmlFor={id}>{label}</label>
      <div className="learning-input-wrap">
        <span className="learning-input-icon">{icon}</span>
        <input
          id={id}
          name={id}
          type={isPassword && showPassword ? "text" : type}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            className="learning-password-toggle"
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            aria-pressed={showPassword}
            aria-controls={id}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginHero() {
  return (
    <section className="learning-hero" aria-labelledby="learning-title">
      <div className="learning-eyebrow">
        <Sparkles size={15} aria-hidden="true" />
        เรียนรู้ในแบบของเรา เติบโตไปด้วยกัน
      </div>
      <h1 id="learning-title">
        ทุกวันคือโอกาสใหม่<br />
        ที่จะ<span className="learning-title-highlight">เก่งขึ้นอีกนิด</span>
        <svg className="learning-heading-spark" width="35" height="42" viewBox="0 0 35 42" fill="none" aria-hidden="true">
          <path d="M5 16 3 5M16 19 23 5M22 29 32 25" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </h1>
      <p className="learning-hero-description">
        พื้นที่สำหรับคนช่างสงสัย กล้าลอง และพร้อมเรียนรู้<br className="learning-desktop-break" />{" "}
        มาเติมความรู้ ฝึกทักษะ และค้นพบศักยภาพของตัวเองกัน
      </p>

      <div className="learning-image-stage">
        <span className="learning-image-tape" aria-hidden="true" />
        <img
          className="learning-hero-image"
          src={learningInspiration}
          alt="แหล่งการเรียนรู้กับครูผู้สร้างแรงบันดาลใจ พร้อมหุ่นยนต์ หนังสือ และอุปกรณ์การเรียน"
          width="1344"
          height="756"
          fetchPriority="high"
        />
        <div className="learning-image-note">
          <span><Heart size={16} fill="currentColor" aria-hidden="true" /></span>
          เรียนรู้ด้วยใจ ไปได้ไกลกว่าที่คิด
        </div>
        <Star className="learning-image-star" size={32} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="learning-features" aria-label="สิ่งที่ทำได้ในห้องเรียน">
        <div>
          <span className="learning-feature-icon learning-feature-blue"><BookOpenCheck size={21} aria-hidden="true" /></span>
          <span><b>ฝึกฝนความรู้</b><small>ทบทวนผ่านแบบทดสอบ</small></span>
        </div>
        <div>
          <span className="learning-feature-icon learning-feature-mint"><ClipboardCheck size={21} aria-hidden="true" /></span>
          <span><b>เรียนรู้อย่างลงมือทำ</b><small>สนุกกับงานที่ได้รับมอบหมาย</small></span>
        </div>
        <div>
          <span className="learning-feature-icon learning-feature-yellow"><ChartNoAxesCombined size={21} aria-hidden="true" /></span>
          <span><b>เห็นการเติบโต</b><small>ติดตามผลการเรียนรู้ของเรา</small></span>
        </div>
      </div>
    </section>
  );
}

function LoginForm({ loading, onLogin }: LoginPageProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    const formData = new FormData(event.currentTarget);
    onLogin(String(formData.get("identifier")), String(formData.get("password")));
  };

  return (
    <section className="learning-login-panel" aria-labelledby="login-title">
      <div className="learning-card-decoration" aria-hidden="true"><BookOpen size={27} /><Sparkles size={19} /></div>
      <div className="learning-login-card">
        <div className="learning-card-heading">
          <span className="learning-welcome-icon"><GraduationCap size={30} strokeWidth={1.7} aria-hidden="true" /></span>
          <span className="learning-card-kicker">LET’S LEARN SOMETHING NEW</span>
          <h2 id="login-title">ยินดีต้อนรับกลับมา <span>☺</span></h2>
          <p>พร้อมสำหรับการเรียนรู้วันนี้แล้วหรือยัง?</p>
        </div>

        <form onSubmit={submit}>
          <fieldset className="learning-fields" disabled={loading}>
            <legend className="learning-sr-only">ข้อมูลเข้าสู่ระบบนักเรียน</legend>
            <LoginField
              id="identifier"
              label="รหัสประจำตัวนักเรียน"
              icon={<UserRound size={19} aria-hidden="true" />}
              autoComplete="username"
              placeholder="กรอกรหัสนักเรียน เช่น 25484"
            />
            <LoginField
              id="password"
              label="รหัสผ่าน"
              icon={<LockKeyhole size={19} aria-hidden="true" />}
              type="password"
              autoComplete="current-password"
              minLength={8}
              placeholder="กรอกรหัสผ่านของคุณ"
            />
          </fieldset>

          <button className="learning-submit" type="submit" disabled={loading} aria-busy={loading}>
            {loading ? (
              <><LoaderCircle className="learning-loading-spinner" size={20} aria-hidden="true" /><span role="status">กำลังเข้าสู่ห้องเรียน...</span></>
            ) : (
              <><span>เข้าสู่ห้องเรียน</span><ArrowRight size={20} aria-hidden="true" /></>
            )}
          </button>
        </form>

        <div className="learning-secure-note"><ShieldCheck size={15} aria-hidden="true" />พื้นที่การเรียนรู้สำหรับนักเรียนของเรา</div>

        <div className="learning-help">
          <details>
            <summary>เข้าสู่ระบบไม่ได้?<ChevronDown size={15} aria-hidden="true" /></summary>
            <p>ใช้รหัสประจำตัวนักเรียนและรหัสผ่านที่ได้รับจากครู หากลืมรหัสผ่านหรือยังไม่มีบัญชี กรุณาติดต่อครูประจำวิชาเพื่อขอความช่วยเหลือ</p>
          </details>
        </div>
      </div>

      <div className="learning-encouragement">
        <span className="learning-tip-icon"><Lightbulb size={24} strokeWidth={1.7} aria-hidden="true" /></span>
        <div><b>ไม่ต้องเก่งตั้งแต่เริ่ม แค่เริ่มก็เก่งขึ้นแล้ว</b><p>ค่อย ๆ เรียนรู้ทีละนิด ในจังหวะของตัวเองนะ</p></div>
      </div>
    </section>
  );
}

export function LoginPage({ loading, onLogin }: LoginPageProps) {
  return (
    <div className="learning-login-page">
      <div className="learning-page-orb learning-page-orb-one" aria-hidden="true" />
      <div className="learning-page-orb learning-page-orb-two" aria-hidden="true" />

      <header className="learning-header">
        <Brand />
        <span className="learning-header-label"><GraduationCap size={17} aria-hidden="true" />ห้องเรียนออนไลน์สำหรับนักเรียน</span>
      </header>

      <main className="learning-login-grid">
        <LoginHero />
        <LoginForm loading={loading} onLogin={onLogin} />
      </main>

      <footer className="learning-footer">
        <span>© {new Date().getFullYear()} LAB EDU <span className="learning-footer-divider">|</span> เรียนรู้ · สร้างสรรค์ · พัฒนา</span>
        <span>สร้างพื้นที่การเรียนรู้ด้วย <Heart size={12} fill="currentColor" aria-label="ความรัก" /></span>
      </footer>
    </div>
  );
}
