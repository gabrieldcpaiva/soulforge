import { describe, expect, test } from "bun:test";
import { SoulMapSnapshot } from "../src/core/context/soul-map-snapshot.js";
import { cacheTtlToMs, supportsPromptCache } from "../src/core/llm/cache-support.js";
import { hash32Hex } from "../src/core/utils/hash.js";

describe("SoulMapSnapshot — idle TTL", () => {
  test("read returns frozen content and bumps lastAccessedAt", () => {
    const snap = new SoulMapSnapshot(
      { content: "v1", paths: new Set(), ttlMs: 60_000 },
      1_000,
    );
    expect(snap.read(2_000)).toBe("v1");
    expect(snap.lastAccessedAt).toBe(2_000);
    expect(snap.read(50_000)).toBe("v1");
    expect(snap.lastAccessedAt).toBe(50_000);
  });

  test("continuous use stays hot past birth-time TTL", () => {
    const snap = new SoulMapSnapshot({ content: "x", paths: new Set(), ttlMs: 60_000 }, 0);
    // Read every 30s for an hour — birth at 0, last access at 3_600_000.
    for (let t = 30_000; t <= 3_600_000; t += 30_000) {
      snap.read(t);
      expect(snap.isIdleExpired(t)).toBe(false);
    }
  });

  test("idle past TTL marks expired", () => {
    const snap = new SoulMapSnapshot({ content: "x", paths: new Set(), ttlMs: 60_000 }, 0);
    snap.read(10_000);
    expect(snap.isIdleExpired(60_000)).toBe(false);
    expect(snap.isIdleExpired(70_001)).toBe(true);
  });

  test("hash is deterministic and stable for same content", () => {
    const a = new SoulMapSnapshot({ content: "hello world", paths: new Set(), ttlMs: 0 });
    const b = new SoulMapSnapshot({ content: "hello world", paths: new Set(), ttlMs: 0 });
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toBe(hash32Hex("hello world"));
  });
});

describe("supportsPromptCache — model family gating", () => {
  test("claude family (direct + gateways + kimi)", () => {
    for (const id of [
      "anthropic/claude-sonnet-4-6",
      "proxy/claude-opus-4-5",
      "llmgateway/claude-sonnet-4",
      "openrouter/anthropic/claude-3.5-sonnet",
      "moonshot/kimi-k2",
      "openrouter/moonshotai/kimi-k2",
    ]) {
      const s = supportsPromptCache(id);
      expect(s.enabled).toBe(true);
      expect(s.explicit).toBe(true);
    }
  });

  test("implicit caches (openai, gemini, deepseek, xai)", () => {
    for (const id of [
      "openai/gpt-5.4",
      "openai/o3",
      "google/gemini-2.5-pro",
      "deepseek/deepseek-chat",
      "xai/grok-4",
      "openrouter/google/gemini-2.5-flash",
    ]) {
      const s = supportsPromptCache(id);
      expect(s.enabled).toBe(true);
      expect(s.explicit).toBe(false);
    }
  });

  test("unknown providers fall back to no-cache", () => {
    expect(supportsPromptCache("groq/llama-3-70b").enabled).toBe(false);
    expect(supportsPromptCache("custom/unknown-model").enabled).toBe(false);
  });
});

describe("cacheTtlToMs", () => {
  test("maps 5m and 1h", () => {
    expect(cacheTtlToMs("5m")).toBe(5 * 60_000);
    expect(cacheTtlToMs("1h")).toBe(60 * 60_000);
  });
});
