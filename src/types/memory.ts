export type MemoryCategory = "preference" | "profile" | "project" | "other";
export type MemorySource = "auto" | "user";

export interface SavedMemory {
  id: number;
  text: string;
  category: MemoryCategory;
  source: MemorySource;
  created_at: string | null;
  updated_at: string | null;
}

export interface MemorySettingsResponse {
  memory_enabled: boolean;
  memories: SavedMemory[];
}

export interface MemoryWrite {
  text: string;
  category: MemoryCategory;
}
