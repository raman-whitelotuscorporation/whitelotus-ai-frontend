"use client";

import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "@/lib/api";
import type { KBDocument } from "@/types/chat";

const POLL_INTERVAL_MS = 5000;
const TERMINAL_STATUSES = new Set<KBDocument["status"]>(["COMPLETED", "FAILED"]);

async function fetchAllDocuments(): Promise<KBDocument[]> {
  const PAGE = 200;
  let all: KBDocument[] = [];
  let offset = 0;
  while (true) {
    const page = await fetchDocuments(PAGE, offset);
    all = all.concat(Array.isArray(page) ? page : []);
    if (!Array.isArray(page) || page.length < PAGE) break;
    offset += PAGE;
  }
  return all;
}

export function useDocuments() {
  const qc = useQueryClient();

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: fetchAllDocuments,
    // Poll every 5s while any doc is still processing; stop when all are terminal
    refetchInterval: (query) =>
      query.state.data?.some((d) => !TERMINAL_STATUSES.has(d.status))
        ? POLL_INTERVAL_MS
        : false,
    staleTime: 30_000,
  });

  const docs = data ?? [];
  const errorMessage = error instanceof Error ? error.message : error ? "Could not load documents. Is the RAG service running?" : null;

  // Optimistic update helper used by KnowledgeBase after ingest/delete
  const setDocs = (updater: KBDocument[] | ((prev: KBDocument[]) => KBDocument[])) => {
    qc.setQueryData(["documents"], typeof updater === "function" ? updater : () => updater);
  };

  return { docs, setDocs, loading, error: errorMessage, refresh: refetch };
}
