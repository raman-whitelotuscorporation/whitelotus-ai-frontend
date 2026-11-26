"use client";
import type { ReactNode } from "react";
import RightPanel from "@/components/RightPanel";
import { useShellStore } from "@/store/shellStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const NOOP = () => {};

export default function ChatLayout({ children }: { children: ReactNode }) {
  const connectedPlugins = useShellStore((s) => s.connectedPlugins);
  const kbDocs           = useShellStore((s) => s.kbDocs);
  const onOpenPlugins    = useShellStore((s) => s.onOpenPlugins);
  const onOpenKB         = useShellStore((s) => s.onOpenKB);
  const onSendMessage    = useShellStore((s) => s.onSendMessage);
  const isDesktop        = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {children}
      {isDesktop && (
        <RightPanel
          connectedPlugins={connectedPlugins}
          onOpenPlugins={onOpenPlugins ?? NOOP}
          onSendMessage={onSendMessage ?? NOOP}
          onOpenKB={onOpenKB ?? NOOP}
          kbDocs={kbDocs}
        />
      )}
    </div>
  );
}
