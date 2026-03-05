"use client";

interface AttendHeaderProps {
  navOffset?: number;
  onContact?: () => void;
}

export default function AttendHeader({
  navOffset = 112,
  onContact,
}: AttendHeaderProps) {
  const handleContact = () => {
    if (onContact) {
      onContact();
      return;
    }
    const el = document.getElementById("contact");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="self-start flex flex-col gap-8"
      style={{ position: "sticky", top: navOffset }}
    >
      {/* Label */}
      <span
        className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase"
        style={{ color: "#6C63FF" }}
      >
        <span
          className="inline-block w-6 h-px"
          style={{ background: "#6C63FF" }}
        />
        Join Us
      </span>

      {/* Title */}
      <h2
        className="text-4xl xl:text-5xl font-bold leading-tight"
        style={{
          fontFamily: "'Noto Sans Mongolian', 'Noto Sans', Georgia, serif",
          color: "#0F0F0F",
          letterSpacing: "-0.01em",
        }}
      >
        Хуруу хээ өсвөрийн конферренсэд нэгдэх вэ?
      </h2>

      {/* Description */}
      <p
        className="text-base leading-relaxed max-w-sm"
        style={{
          fontFamily: "'Noto Sans', system-ui, sans-serif",
          color: "#5A5A6E",
        }}
      >
        Та хурууны хээ өсвөрийн конферренсэд дараах байдлаар хамтран оролцох
        боломжтой.
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleContact}
          className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          style={{
            background: "linear-gradient(135deg, #6C63FF 0%, #4F46E5 100%)",
            boxShadow: "0 8px 24px rgba(108,99,255,0.35)",
            fontFamily: "'Noto Sans', system-ui, sans-serif",
          }}
        >
          Холбогдох →
        </button>

        <button
          onClick={handleContact}
          className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border"
          style={{
            fontFamily: "'Noto Sans', system-ui, sans-serif",
            color: "#0F0F0F",
            borderColor: "rgba(0,0,0,0.15)",
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(8px)",
          }}
        >
          Асуух
        </button>
      </div>
    </div>
  );
}
