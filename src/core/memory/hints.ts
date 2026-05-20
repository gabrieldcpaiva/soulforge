/**
 * Inline memory hints — surface "[+N memories]" alongside tool results that
 * touch files with linked memories. Encourages the agent to lean on memory
 * search naturally without needing to think about it.
 *
 * Wired by ContextManager via setMemoryHintProvider; tools call
 * countMemoriesForPaths(paths) — fast SQLite lookup, zero awaited I/O on the
 * read-only path.
 */
import type { MemoryManager } from "./manager.js";

let _manager: MemoryManager | null = null;

export function setMemoryHintProvider(manager: MemoryManager | null): void {
  _manager = manager;
}

/**
 * Count memories whose file_refs intersect the given relative paths.
 * Returns 0 if no manager wired, or the paths array is empty.
 * Safe to call from any tool — never throws.
 */
export function countMemoriesForPaths(paths: string[]): number {
  if (!_manager || paths.length === 0) return 0;
  try {
    const projectDb = _manager.getDbForScope("project");
    const globalDb = _manager.getDbForScope("global");
    const ids = new Set<string>();
    for (const id of projectDb.findByPaths(paths, 100)) ids.add(id);
    for (const id of globalDb.findByPaths(paths, 100)) ids.add(id);
    return ids.size;
  } catch {
    return 0;
  }
}

/**
 * Format a one-line hint. Returns empty string when count === 0 so callers
 * can unconditionally concatenate.
 */
export function formatMemoryHint(count: number): string {
  if (count <= 0) return "";
  return count === 1 ? "\n· 1 memory" : `\n· ${String(count)} memories`;
}

/**
 * Convenience: count + format in one call. Returns "" when nothing linked.
 */
export function memoryHintForPaths(paths: string[]): string {
  return formatMemoryHint(countMemoriesForPaths(paths));
}
