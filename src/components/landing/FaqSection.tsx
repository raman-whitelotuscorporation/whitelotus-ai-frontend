"use client";
import { useState, useRef } from "react";
import { useReveal } from "@/hooks/useReveal";

const FAQS = [
  {
    q: "Is WhiteLotus AI self-hosted?",
    a: "Yes. WhiteLotus AI runs entirely on your own infrastructure using Docker Compose. There is no cloud-hosted version — your data, your models, and your deployment stay under your control.",
  },
  {
    q: "Which LLM providers are supported?",
    a: "WhiteLotus AI is configurable. You can connect it to OpenRouter, OpenAI, Anthropic, or Gemini by setting the LLM_PROVIDER and LLM_API_KEY environment variables. The model name is also configurable.",
  },
  {
    q: "What file types can I upload to the knowledge base?",
    a: "You can upload PDFs, plain text files, and other common document formats. You can also ingest raw text directly. Documents are chunked, embedded, and stored in your PostgreSQL database with pgvector.",
  },
  {
    q: "How do integrations work?",
    a: "Integrations use standard OAuth flows. You authorize WhiteLotus AI once per tool, and the AI can then query that tool directly from the chat interface using the @ToolName syntax.",
  },
  {
    q: "What are the system requirements?",
    a: "You need Docker and Docker Compose to run the backend services, and Node.js 18+ for the frontend. The stack includes PostgreSQL, Redis, and RabbitMQ — all managed via Docker Compose.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-5"
      style={{ background: "var(--surface-page)" }}
    >
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12 reveal-hidden reveal-d1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            FAQ
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Common questions
          </h2>
        </div>

        <div className="space-y-2 reveal-hidden reveal-d2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`landing-faq-item${isOpen ? " open" : ""}`}
              >
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {faq.q}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-4 h-4 shrink-0 transition-transform duration-200"
                    style={{
                      color: "var(--text-muted)",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 animate-fade-in">
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
