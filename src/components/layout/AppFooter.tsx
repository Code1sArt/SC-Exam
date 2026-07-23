import { Mail } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl border-t border-[#dce7e1] px-4 py-5 text-center text-[11px] leading-5 text-[#71847d] sm:px-6">
      <p>© {new Date().getFullYear()} Lab EDU. พัฒนาโดย ครูสิทธิพล ฉัตรวงศ์ศรี</p>
      <p>โรงเรียนนางรอง จังหวัดบุรีรัมย์</p>
      <a className="mt-2 inline-flex items-center gap-1.5 font-medium text-[#c63d38] transition hover:text-[#9d2e2a]" href="mailto:waiiappza@gmail.com" aria-label="ติดต่อผ่าน Gmail ที่ waiiappza@gmail.com">
        <Mail size={14} fill="currentColor" strokeWidth={1.8} />waiiappza@gmail.com
      </a>
    </footer>
  );
}
