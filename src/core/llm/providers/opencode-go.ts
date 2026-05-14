import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { LanguageModel } from "ai";
import { loadConfig } from "../../../config/index.js";
import { getProviderApiKey } from "../../secrets.js";
import { getCompatReasoningBody } from "../compat-reasoning.js";
import { createReasoningFetchWrapper } from "./reasoning-fetch.js";
import type { ProviderDefinition, ProviderModelInfo } from "./types.js";

const BASE_URL = "https://opencode.ai/zen/go/v1";

export const opencodeGo: ProviderDefinition = {
  id: "opencode-go",
  name: "OpenCode Go",
  envVar: "OPENCODE_GO_API_KEY",
  icon: "\uE795", // nf-dev-go U+E795
  secretKey: "opencode-go-api-key",
  keyUrl: "opencode.ai",
  asciiIcon: "GO",
  description: "GLM, Kimi, MiMo, MiniMax, Qwen, DeepSeek models",

  createModel(modelId: string): LanguageModel {
    const apiKey = getProviderApiKey("OPENCODE_GO_API_KEY");
    if (!apiKey) {
      throw new Error("OPENCODE_GO_API_KEY is not set");
    }
    // Use @ai-sdk/openai-compatible to properly handle reasoning_content
    // Fixes 400 error: "thinking is enabled but reasoning_content is missing"
    const reasoningBody = getCompatReasoningBody(`opencode-go/${modelId}`, loadConfig());
    const reasoningFetch = createReasoningFetchWrapper(reasoningBody);
    const provider = createOpenAICompatible({
      name: "opencode-go",
      baseURL: BASE_URL,
      apiKey,
      ...(reasoningFetch ? { fetch: reasoningFetch as typeof fetch } : {}),
    });
    return provider.chatModel(modelId);
  },

  async fetchModels(): Promise<ProviderModelInfo[] | null> {
    const apiKey = getProviderApiKey("OPENCODE_GO_API_KEY");
    if (!apiKey) return null;
    try {
      const res = await fetch("https://opencode.ai/zen/go/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { data: Array<{ id: string }> };
      return data.data.map((m) => ({ id: m.id, name: m.id }));
    } catch {
      return null;
    }
  },

  // model list from https://opencode.ai/docs/go
  fallbackModels: [
    { id: "glm-5.1", name: "GLM 5.1" },
    { id: "glm-5", name: "GLM 5" },
    { id: "kimi-k2.6", name: "Kimi K2.6" },
    { id: "kimi-k2.5", name: "Kimi K2.5" },
    { id: "mimo-v2.5-pro", name: "MiMo V2.5 Pro" },
    { id: "mimo-v2.5", name: "MiMo V2.5" },
    { id: "minimax-m2.7", name: "MiniMax M2.7" },
    { id: "minimax-m2.5", name: "MiniMax M2.5" },
    { id: "qwen3.6-plus", name: "Qwen3.6 Plus" },
    { id: "qwen3.5-plus", name: "Qwen3.5 Plus" },
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro" },
    { id: "deepseek-v4-flash", name: "DeepSeek V4 Flash" },
  ],

  contextWindows: [
    // GLM models: ~200k context window (docs.z.ai)
    ["glm-5.1", 204_800],
    ["glm-5", 204_800],
    // Kimi K2.5/K2.6
    ["kimi-k2.6", 262_000],
    ["kimi-k2.5", 262_000],
    // MiMo V2.5 — docs say ≤ 256K
    ["mimo-v2.5-pro", 262_144],
    ["mimo-v2.5", 262_144],
    // MiniMax
    ["minimax-m2.7", 196_000],
    ["minimax-m2.5", 196_000],
    // Qwen
    ["qwen3.6-plus", 1_000_000],
    ["qwen3.5-plus", 1_000_000],
    // DeepSeek V4
    ["deepseek-v4-pro", 131_072],
    ["deepseek-v4-flash", 131_072],
  ],
};
