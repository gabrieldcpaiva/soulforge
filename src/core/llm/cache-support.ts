import { detectModelFamily, type ModelFamily } from "./provider-options.js";

/**
 * Whether a model supports prompt caching, and how.
 *
 * `explicit` — the model supports `cache_control` breakpoints (Anthropic-style).
 *   We don't inject these ourselves (Anthropic auto-caches the system prompt
 *   prefix; max 4 breakpoints constrains manual placement) but the family flag
 *   gates snapshot freezing.
 *
 * `enabled` — caching is active in some form. Even implicit caches (OpenAI,
 *   DeepSeek, Gemini-via-OpenRouter, Groq Kimi K2, Moonshot) benefit from
 *   a byte-stable prompt prefix → freezing the soul-map snapshot pays off.
 *
 * `enabled=false` (Groq legacy, xAI Grok, unknown gateways) → live render is
 *   strictly better: no stale data, no cache to preserve.
 */
export interface CacheSupport {
  enabled: boolean;
  explicit: boolean;
}

const NONE: CacheSupport = { enabled: false, explicit: false };
const EXPLICIT: CacheSupport = { enabled: true, explicit: true };
const IMPLICIT: CacheSupport = { enabled: true, explicit: false };

/**
 * Resolve prompt-cache support for a model id. Works for direct providers and
 * gateways (proxy, llmgateway, openrouter, vercel_gateway, opencode_*) because
 * `detectModelFamily` already collapses gateway IDs to their underlying family.
 */
export function supportsPromptCache(modelId: string): CacheSupport {
  const family: ModelFamily = detectModelFamily(modelId);

  switch (family) {
    case "claude":
      // Direct Anthropic + all gateways routing to Claude + Kimi K2 (Anthropic-compatible)
      return EXPLICIT;
    case "google":
      // Gemini 2.5+ via OpenRouter is implicit; direct API is explicit. Treat as enabled.
      return IMPLICIT;
    case "openai":
      // GPT-4o/4.1/5.x and o-series cache automatically above 1024 tokens.
      return IMPLICIT;
    case "deepseek":
    case "deepseek-reasoner":
      // Persistent prefix cache, automatic.
      return IMPLICIT;
    case "xai":
      // Implicit prefix matching since late 2025.
      return IMPLICIT;
    case "other":
      return NONE;
    default:
      return NONE;
  }
}

/** Convert a Claude-style TTL string to milliseconds. */
export function cacheTtlToMs(ttl: "5m" | "1h"): number {
  return ttl === "1h" ? 60 * 60_000 : 5 * 60_000;
}
