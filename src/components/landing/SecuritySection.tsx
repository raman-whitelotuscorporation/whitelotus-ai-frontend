"use client";
import { useRef } from "react";
import { useReveal } from "@/hooks/useReveal";

const PRINCIPLES = [
  {
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z",
    title: "Answers grounded in accessible information",
    body: "The agent answers based on documents you have uploaded and tools you have authorized. It does not fabricate sources or claim access it does not have.",
  },
  {
    icon: "M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1",
    title: "Source references where available",
    body: "When the retrieval or integration implementation provides source information, it is shown alongside the response so you can verify what you receive.",
  },
  {
    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    title: "User-authorized integrations",
    body: "Each integration requires explicit OAuth authorization from the user. The agent only accesses tools and data that the authorizing user has permitted.",
  },
  {
    icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    title: "Respect for existing access controls",
    body: "The agent operates within the permissions granted by each user's OAuth tokens. It does not bypass or escalate access beyond what has been authorized.",
  },
];

export default function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-5"
      style={{ background: "var(--surface-sidebar)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 reveal-hidden reveal-d1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            How it works responsibly
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Built on accessible, authorized information
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)" }}
          >
            WhiteLotusAI answers based on what you have connected and
            authorized. It identifies when information is missing rather than
            guessing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {PRINCIPLES.map((item, i) => (
            <div
              key={item.title}
              className={`landing-card p-6 flex gap-4 reveal-hidden reveal-d${i + 2}`}
            >
              <div className="landing-icon-wrap mt-0.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  className="w-5 h-5"
                >
                  <path d={item.icon} />
                </svg>
              </div>
              <div>
                <h3
                  className="text-sm font-semibold mb-1.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
