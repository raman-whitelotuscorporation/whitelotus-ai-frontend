"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addMemory as apiAddMemory, clearMemories as apiClearMemories,
  deleteMemory as apiDeleteMemory, fetchMemories, setMemoryEnabled as apiSetMemoryEnabled,
  updateMemory as apiUpdateMemory,
} from "@/lib/api";
import type { MemorySettingsResponse, MemoryWrite, SavedMemory } from "@/types/memory";

export function useMemories() {
  const [memories, setMemories] = useState<SavedMemory[]>([]);
  const [memoryEnabled, setMemoryEnabledState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: MemorySettingsResponse = await fetchMemories();
      setMemories(Array.isArray(data.memories) ? data.memories : []);
      setMemoryEnabledState(data.memory_enabled !== false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load saved memories.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchMemories()
      .then((data) => {
        if (!active) return;
        setMemories(Array.isArray(data.memories) ? data.memories : []);
        setMemoryEnabledState(data.memory_enabled !== false);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load saved memories.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const add = useCallback(async (value: MemoryWrite) => {
    setIsBusy(true);
    try {
      const created = await apiAddMemory(value);
      const refreshed = await fetchMemories();
      setMemories(Array.isArray(refreshed.memories) ? refreshed.memories : [created]);
      setMemoryEnabledState(refreshed.memory_enabled !== false);
      return created;
    } finally { setIsBusy(false); }
  }, []);

  const update = useCallback(async (id: number, value: MemoryWrite) => {
    setIsBusy(true);
    try {
      const saved = await apiUpdateMemory(id, value);
      setMemories((current) => current.map((item) => item.id === id ? saved : item));
      return saved;
    } finally { setIsBusy(false); }
  }, []);

  const remove = useCallback(async (id: number) => {
    setIsBusy(true);
    try {
      await apiDeleteMemory(id);
      setMemories((current) => current.filter((item) => item.id !== id));
    } finally { setIsBusy(false); }
  }, []);

  const clearAll = useCallback(async () => {
    setIsBusy(true);
    try {
      await apiClearMemories();
      setMemories([]);
    } finally { setIsBusy(false); }
  }, []);

  const setEnabled = useCallback(async (enabled: boolean) => {
    setIsBusy(true);
    try {
      const saved = await apiSetMemoryEnabled(enabled);
      setMemoryEnabledState(saved);
    } finally { setIsBusy(false); }
  }, []);

  return { memories, memoryEnabled, isLoading, isBusy, error, refresh, add, update, remove, clearAll, setEnabled };
}
