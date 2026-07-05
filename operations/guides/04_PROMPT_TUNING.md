# Tuning Agent Prompts

Every agent in `.claude/agents/` is a markdown file whose body *is* the prompt. Unlike code, a
prompt change can "look fine" on read-through and still shift behavior in ways you won't notice
without actually comparing outputs. This guide is the discipline for changing them safely.

## Why prompts are the defensible asset

The CEO review's competitive-risk finding is worth restating here: the hooks, directory
structure, and skill orchestration are all things a competing harness (or a first-party Claude
Code feature) could replicate. What's hard to replicate cheaply is *well-calibrated prompts* —
the strategist's objective-deconstruction method, the analyst's conflict-isolation discipline,
the verifier's grounded/extrapolated/unsupported rubric. These are plain markdown, which means
they're also portable if the harness ever needs to run on a different substrate. Treat prompt
quality as the thing worth the most careful iteration, not the part you touch quickly to
"just fix" one bad output.

## Before changing a prompt: is it actually a prompt problem?

A bad artifact has at least three possible causes, and only one is fixed by editing the prompt:

1. **Template/prompt mismatch** — the agent is describing content the template doesn't have a
   section for, or vice versa. Fix: `01_EDITING.md`'s template-editing section, not the prompt.
2. **Corpus problem** — the source material is genuinely thin, contradictory, or off-topic for
   the question asked. Fix: better corpus curation (`03_OUTPUT_QUALITY.md`), not the prompt.
3. **Prompt problem** — the agent has what it needs and produces a weak result anyway (vague
   claims, missed the research questions, invented content where "insufficient evidence" was the
   honest answer). This is what this guide covers.

Misdiagnosing #1 or #2 as #3 leads to prompt edits that don't fix the actual issue and add noise
to the agent's instructions over time.

## The before/after artifact diff method

1. **Capture the current behavior first.** Before editing, run the agent (via its skill) on a
   real or representative input and save the output artifact somewhere outside the pipeline
   (e.g. a scratch file) — this is your baseline.
2. **Make one focused change** to the agent's `.md` file. Resist bundling multiple unrelated
   tweaks; if the output changes, you want to know which edit caused it.
3. **Re-run on the same input** (or as close as the pipeline allows — some phases consume-and-
   archive their input, so you may need to feed the same content via a duplicate raw file).
4. **Diff the two outputs directly**, not just "does it look better." Ask specifically: did the
   change fix the targeted issue? Did it introduce a new one (e.g. a stricter instruction that
   now makes the agent refuse to answer questions it previously handled adequately)?
5. **Only then** let the change flow into a real pipeline run.

## What NOT to do

- Don't tune a prompt against a single bad output you're annoyed by — you'll overfit to that one
  case and may regress the common case. Look for a pattern across 2-3 outputs before concluding
  the prompt itself is the issue.
- Don't grant an agent new tools (Write, Bash) to work around a prompt limitation — see
  `01_EDITING.md`'s note on why agents stay Read/Grep/Glob-only. If an agent "needs" to write
  something, that's the calling skill's job.
- Don't copy instructions from one agent to another without checking they still make sense in
  context — e.g. the verifier's "you do not fix the artifact, you judge it" boundary is load-
  bearing for the pipeline's structure (VERIFY is a checkpoint, not a repair phase); an agent that
  quietly starts "helpfully" fixing things it's supposed to only judge breaks that separation.

## Substrate portability

Because agent definitions are plain markdown with YAML frontmatter (`model:`, `tools:`,
`description:`), they don't depend on Claude Code internals beyond the `Agent` tool's resolution
mechanism. If you ever need to port this harness to a different orchestration substrate, the
prompts themselves should transfer with minimal rework — the frontmatter's model-tier routing
and tool restrictions are the only Claude-Code-specific parts, and they're a thin, well-isolated
layer on top of the actual prompt content.
