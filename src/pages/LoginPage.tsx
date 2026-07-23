import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";
import bannerImage from "../assets/lab-edu-banner.png";
import { AppFooter } from "../components/layout/AppFooter";

export function LoginPage({ loading, onLogin }: { loading: boolean; onLogin: (identifier: string, password: string) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); onLogin(String(data.get("identifier")), String(data.get("password"))); };
  return (
    <main className="grid min-h-screen bg-[#f7faf8] lg:grid-cols-[1.08fr_.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img src={bannerImage} alt="ครูวายกับการศึกษายุคใหม่ด้วย AI" className="absolute inset-0 size-full object-cover object-[58%_center]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,39,44,.84)_0%,rgba(0,50,56,.56)_46%,rgba(0,50,56,.08)_72%,rgba(0,50,56,.02)_100%)]" />
        <div className="relative flex h-full max-w-xl flex-col p-12 text-white xl:p-16">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-white text-[#176b55]"><GraduationCap size={22} /></span><b className="text-lg">Lab EDU</b></div>
          <div className="my-auto max-w-md"><span className="text-xs font-semibold text-[#bde8d9]">LEARNING FOR THE FUTURE</span><h1 className="mt-4 text-4xl font-bold leading-[1.35] xl:text-5xl">Lab EDU<br />การศึกษายุคใหม่<br />กับครู (Gen) Y</h1><p className="mt-5 max-w-sm text-sm leading-7 text-white/85">พื้นที่เรียนรู้และทำข้อสอบที่ช่วยให้ทุกก้าวของนักเรียนชัดเจนขึ้น</p></div>
          <p className="text-xs text-white/70">เรียนรู้จากทุกคำตอบ ไม่ใช่แค่คะแนนปลายทาง</p>
        </div>
      </section>
      <section className="flex min-h-screen flex-col px-6 py-10 sm:px-10">
        <form className="m-auto w-full max-w-sm" onSubmit={submit}>
          <div className="mb-10 lg:hidden"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-[#176b55] text-white"><GraduationCap size={22} /></span><b className="text-lg text-[#18322d]">Lab EDU</b></div><p className="mt-3 text-xs font-semibold leading-5 text-[#237b63]">การศึกษายุคใหม่ กับครู (Gen) Y</p></div>
          <span className="text-xs font-semibold text-[#237b63]">สำหรับนักเรียน</span><h2 className="mt-3 text-3xl font-bold text-[#18322d]">กลับมาเรียนรู้กันต่อ</h2><p className="mt-2 text-sm leading-6 text-[#71847d]">เข้าสู่ระบบเพื่อดูแบบทดสอบที่ได้รับมอบหมาย</p>
          <label className="mt-9 block text-xs font-semibold text-[#415b53]">รหัสประจำตัวนักเรียน<input className="student-input mt-2" name="identifier" required autoComplete="username" placeholder="เช่น STU001" /></label>
          <label className="mt-5 block text-xs font-semibold text-[#415b53]">รหัสผ่าน<input className="student-input mt-2" type="password" name="password" required minLength={8} autoComplete="current-password" placeholder="กรอกรหัสผ่าน" /></label>
          <button className="student-button-primary mt-7 h-12 w-full text-sm" disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ..." : <><span>เข้าสู่ระบบ</span><ArrowRight size={17} /></>}</button>
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[#879890]"><ShieldCheck size={15} />ข้อมูลการทำข้อสอบของคุณถูกเก็บอย่างปลอดภัย</div>
        </form>
        <AppFooter />
      </section>
    </main>
  );
}
