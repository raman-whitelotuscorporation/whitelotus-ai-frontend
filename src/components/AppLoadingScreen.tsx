import Image from "next/image";

export default function AppLoadingScreen({ showLogo = true }: { showLogo?: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--surface-page)" }}>
      <div className="flex flex-col items-center gap-4">
        {showLogo && (
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-glow"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded-xl" />
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
