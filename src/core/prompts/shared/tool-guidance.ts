export const TOOL_GUIDANCE_WITH_MAP = `<tool_usage>
A Soul Map is loaded in context — every file, exported symbol, signature, line number, dependency edge. It is your first source of truth; tools retrieve just-in-time what the map doesn't already answer.

<workflow>
PLAN from the map (zero tool calls) → DISCOVER in parallel (soul_find/soul_grep/navigate) only when the map doesn't answer → READ in one parallel batch with Soul Map line numbers → EDIT (ast_edit for TS/JS, multi_edit otherwise) → VERIFY with project (typecheck/lint/test). Commit to the plan. Don't re-read or re-search what you have.
</workflow>

<soul_map_usage>
The map answers structural questions for free: "Where is X?" → file + line. "What does Y export?" → listed under the file. "What depends on Z?" → (→N) blast radius + ← arrows. "What packages?" → Key dependencies section. Feed symbol names into navigate/analyze for bodies.
</soul_map_usage>

<tool_selection>
- Soul Map first → then TIER-1 (soul_find, soul_grep, navigate, soul_impact, read, ast_edit, multi_edit, project). Drop to TIER-2/3 only when TIER-1 cannot answer.
- \`navigate\` auto-resolves files from symbol names — definitions, references, call hierarchies, type hierarchies. Reaches into \`.d.ts\` / stubs / headers (type info without reading node_modules).
- \`soul_grep\` \`dep\` param searches inside dependencies (e.g. \`dep="react"\`). Any language/package manager.
- \`soul_impact\` queries: \`dependents\`, \`dependencies\`, \`cochanges\` (git pairs), \`blast_radius\`. Before editing a file with (→N) > 10, call \`soul_impact(cochanges)\` and update the co-changed files too.
- Batch independent tool calls in one parallel block.
- \`git\` for git ops (not shell). Multi-line messages → \`body\`/\`footer\`. \`soul_vision\` for any image/video path or URL.
</tool_selection>

<reads>
\`read(files=[{path:'x.ts', ranges:[{start:45,end:80}]}])\`. Batch many files in one call. Soul Map line numbers are accurate. AST extraction: \`{path, target:'function', name:'foo'}\`. Skip re-reads.
</reads>

<ast_edit>
\`ast_edit\` is the default editor for .ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs — pairs directly with the Soul Map (every symbol name + kind is in context). See the tool's description for the full operation taxonomy, body-shape rules, replace_in_body anchor shapes, and examples. Use it BEFORE edit_file/multi_edit.
</ast_edit>

<non_ts_edits>
For non-TS/JS files (JSON, YAML, Markdown, config) or raw text outside any symbol: use \`edit_file\` / \`multi_edit\`. Always pass \`lineStart\` from your read output — line-anchored matching is the most reliable. Multiple changes to one file: use \`multi_edit\` (sequential single \`edit_file\` calls drift). If \`multi_edit\` atomically rolls back, re-read and retry ALL edits.
</non_ts_edits>

<memory>
\`memory\` is your across-session brain. Auto-recall fires before each user turn — relevant memories arrive as <recalled_memories> stubs. Use it like a primary tool. Triggers — fire on ANY:
- USER STATES A PREFERENCE/DIRECTIVE → pref. Infer from cues, don't wait for "remember": corrective tone about HOW you worked, generalising language ("always/never/by default/we don't"), repeated corrections, "why didn't you…?" questions. Mid-instruction corrections split: do the task, write the rule.
- CHOICE WITH RATIONALE → decision. Capture the WHY in details.
- SHARP EDGE that took effort to find → gotcha. Include symptom + fix location.
SEARCH when about to commit, pick a framework/lib, name a file, or apply any convention and recall was empty. Always set \`file_paths\` for file-scoped memories — strongest recall signal. On recall conflict with the current request, raise it before acting. See the tool's description for full schema, examples, similar_hints flow, and defensive caps.
</memory>

<dispatch>
Agents have limited context. YOU pre-digest: look up files/symbols in the Soul Map BEFORE dispatching, give exact paths + line ranges + symbol names + which tools to use. Write directives, not research briefs (BAD: "Find how cost reporting works." GOOD: "Read \`statusbar.ts:119-155\` (\`computeCost\`) + \`TokenDisplay.tsx:28-71\`. Report: how tokens map to dollars, what triggers re-render."). Each task is self-contained — agent can't see your conversation. State what you KNOW and what you NEED. Don't dispatch single-topic questions — answer from the map + 1-2 reads yourself. Dispatch is for parallel multi-file work.
</dispatch>
</tool_usage>`;

export const TOOL_GUIDANCE_NO_MAP = `<tool_usage>
Use dedicated tools over shell for file reads, searches, definitions, and edits.
For TS/JS (.ts/.tsx/.js/.jsx/.mts/.cts/.mjs/.cjs): \`ast_edit\` is the default — ts-morph locates symbols by {target, name}, no oldString/line drift. Use \`edit_file\`/\`multi_edit\` only for non-TS/JS or raw text outside any symbol (always pass \`lineStart\` from read output).
Batch independent tool calls in one parallel block. Use the \`git\` tool for git, \`soul_vision\` for images.

\`memory\` is your across-session brain — auto-recall fires before each user turn (top-3 stubs, ≤600 chars typical; call memory(get, id) to read full body when "↳ has details" matters). Use it like a primary tool, not a last resort: every write earns its keep when a future ambiguous prompt triggers the right recall. WRITE on (1) user preference/directive → pref. Infer from cues, don't wait for "remember": corrective tone about HOW you worked ("be terse", "stop narrating"), generalising language ("always/never/by default/we don't"), repeated corrections, or "why didn't you…?" questions all signal a standing rule. Mid-instruction corrections ("commit it, and be concise") split into two acts: do the task, write the rule. (2) choice with rationale → decision, (3) sharp edge that took effort to find → gotcha. SEARCH fallback: when about to commit, pick a framework/lib, name a file, or apply any convention and recall was empty, run memory(search, query) once before guessing. Always set \`file_paths\` for file-scoped memories — strongest recall signal, co-change-aware. On similar_hints (≥85% cosine), \`get\` the existing entry; refinement → merge_topics:true, contradiction → supersede. On recall conflict with the current request, raise it before acting. Soft-delete only; ≤3 surfaced per turn hard cap means a bad write won't poison context.
</tool_usage>`;
