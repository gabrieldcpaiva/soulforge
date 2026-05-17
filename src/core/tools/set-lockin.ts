import { tool } from "ai";
import { z } from "zod";

interface SetLockinDeps {
  getLockIn: () => boolean;
  setLockIn: (v: boolean) => void;
}

export function createSetLockinTool(deps: SetLockinDeps) {
  return tool({
    description:
      "Toggle lock-in display mode. Lock-in hides all narration between tool calls; only the tool rail + final answer reach the user. " +
      "Call with on:true as your FIRST tool when starting any multi-step work (reads, edits, searches, dispatches). " +
      "Call with on:false as your LAST tool before writing the final answer, so the user actually sees it. " +
      "Skip both for pure-chat turns that use no other tools. " +
      "Idempotent: calling with the current state is a no-op.",
    inputSchema: z.object({
      on: z
        .boolean()
        .describe(
          "true = lock in (hide narration during work). false = lock out (reveal final answer).",
        ),
      reason: z.string().optional().describe("Optional short reason — for logs/telemetry only."),
    }),
    execute: async ({ on }: { on: boolean; reason?: string }) => {
      const current = deps.getLockIn();
      if (current === on) {
        return `already ${on ? "on" : "off"}`;
      }
      deps.setLockIn(on);
      return `lock-in → ${on ? "on" : "off"}`;
    },
  });
}
