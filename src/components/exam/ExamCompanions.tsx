import capybaraRunning from "../../assets/capybara-running.png";

export function ExamCompanions() {
  return (
    <aside className="exam-companions" aria-label="เพื่อนสัตว์ส่งกำลังใจ">
      <p className="exam-companions-message">
        <span aria-hidden="true">🌿</span>
        ค่อย ๆ ทำไปนะ เพื่อน ๆ เป็นกำลังใจให้
        <span aria-hidden="true">✨</span>
      </p>
      <div className="exam-companions-track" aria-hidden="true">
        <span className="exam-cloud exam-cloud-one" />
        <span className="exam-cloud exam-cloud-two" />
        <span className="exam-grass exam-grass-one">♧</span>
        <span className="exam-grass exam-grass-two">♧</span>

        <span className="exam-animal exam-capybara">
          <img src={capybaraRunning} alt="" />
        </span>

        <span className="exam-animal exam-giraffe">
          <svg viewBox="0 0 90 112" role="presentation">
            <path d="M43 91c-5-18-4-37 3-53l18 5c-7 18-6 34-2 48Z" fill="#f4b947" />
            <path d="M58 46c-7 0-15-4-17-11-2-8 4-17 14-19 11-2 24 5 25 14 1 8-10 16-22 16Z" fill="#f8c65e" />
            <path d="M49 18 46 7M68 18l5-10" stroke="#7a5335" strokeWidth="4" strokeLinecap="round" />
            <circle cx="45" cy="7" r="4" fill="#8d633e" />
            <circle cx="73" cy="8" r="4" fill="#8d633e" />
            <path d="m50 19-8-8M67 18l9-7" stroke="#f4b947" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="65" cy="31" rx="2.4" ry="3" fill="#49382d" />
            <path d="M69 38c3 1 5 0 7-2" fill="none" stroke="#8c533e" strokeWidth="2" strokeLinecap="round" />
            <g fill="#a96f35">
              <ellipse cx="51" cy="29" rx="5" ry="6" transform="rotate(-25 51 29)" />
              <ellipse cx="66" cy="21" rx="4" ry="5" transform="rotate(22 66 21)" />
              <ellipse cx="54" cy="51" rx="4" ry="6" />
              <ellipse cx="49" cy="67" rx="4" ry="6" transform="rotate(18 49 67)" />
              <ellipse cx="57" cy="82" rx="4" ry="6" />
            </g>
            <path d="M44 89 38 105M60 89l7 16" stroke="#d89b3b" strokeWidth="7" strokeLinecap="round" />
            <path d="M34 106h9M64 106h9" stroke="#755238" strokeWidth="4" strokeLinecap="round" />
            <path d="M45 54c-8 4-12 10-14 17" fill="none" stroke="#d89b3b" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </span>

        <span className="exam-animal exam-sloth">
          <svg viewBox="0 0 112 88" role="presentation">
            <path d="M12 24c28-9 58-8 89 0" fill="none" stroke="#729d70" strokeWidth="7" strokeLinecap="round" />
            <path d="M40 28c-9 9-9 27 2 38 12 12 34 9 41-5 7-15-2-31-16-37-10-4-20-2-27 4Z" fill="#a98261" />
            <ellipse cx="61" cy="41" rx="22" ry="16" fill="#e5cfad" />
            <path d="M45 39c4-7 10-9 16-5-3 8-8 12-16 5Zm33 0c-4-7-10-9-16-5 3 8 8 12 16 5Z" fill="#755d4e" />
            <circle cx="56" cy="38" r="2.5" fill="#322b27" />
            <circle cx="68" cy="38" r="2.5" fill="#322b27" />
            <path d="M58 48c3 3 6 3 9 0" fill="none" stroke="#6f5548" strokeWidth="2" strokeLinecap="round" />
            <path d="M44 28c-6-9-12-10-18-4M78 27c5-8 11-9 17-4" fill="none" stroke="#8a674f" strokeWidth="7" strokeLinecap="round" />
            <path d="M47 66c-4 8-3 13 4 16M76 64c5 8 4 13-2 18" fill="none" stroke="#8a674f" strokeWidth="7" strokeLinecap="round" />
          </svg>
        </span>

        <span className="exam-companions-ground" />
      </div>
    </aside>
  );
}
