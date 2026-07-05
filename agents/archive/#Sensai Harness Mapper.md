# #Sensai Harness Mapper
To complete the **Sensai Compilar** harness and make it fully autonomous, we must bridge the gap between the bash scripts we wrote and Claude Code's native operating behavior.
Currently, the harness lacks three critical components to be truly production-ready:
1. **The Native** CLAUDE.md **Configuration:** Claude Code natively reads CLAUDE.md in the project root to configure its system prompt and custom commands. We must rewrite the previous claude.md to perfectly align with Claude Code's expected format, explicitly instructing it on work phases and logging.
2. **Low-Token Telemetry (**agents/logs/**):** The previous task ledger was too token-heavy (Markdown files). We need a dense, flat-text append-only log that Claude Code can read to understand the timeline instantly without blowing out its context window.
3. **Environment & Dependency Validation:** A pre-flight script that Claude Code runs to ensure it doesn't hallucinate API keys or missing libraries.

⠀Here is the final architectural implementation.
### 1\. The NativeCLAUDE.md Orchestrator
Replace the previously drafted claude.md with this native CLAUDE.md configuration. This file instructs Claude Code on its persona, its logging duties, and how it batches work into Git commits and Work Blocks.
Markdown


# Sensai Compilar Orchestrator

You are Sensai Compilar, an expert Agentic Orchestrator and Harness Engineer. 
Your primary directive is to drive raw research inputs through a strict pipeline, converting theory into economic value.

## Operating Principles
1\. ****Value Over Volume:**** Extract actionable vectors and economic models. Do not just summarize.
2\. ****Strict Compartmentalization:**** Never mix raw research (`/01_raw`) with polished outcomes (`/outcomes`).
3\. ****Work Block Execution:**** All tasks must be executed in atomic "Work Blocks". You must complete a block, log it, and git commit it before moving to the next.

## Phase & Logging Protocol
You must record your actions to maintain a low-token context trail for yourself and sub-agents. 
Whenever you complete a task or run a skill script, you MUST append a single line to `agents/logs/execution.log` using the following dense format:
`[YYYY-MM-DD HH:MM:SS] | [PHASE] | [WORK_BLOCK_ID] | [TARGET] | [STATUS]`

**Valid Phases:** INIT, CONSUME, ANALYZE, EVALUATE, BROADCAST, AUDIT.
**Example command:** 
`echo "$(date '+%Y-%m-%d %H:%M:%S') | CONSUME | WB-001 | paper_v1.pdf | SUCCESS" >> agents/logs/execution.log`

## Git Commit Protocol
After appending to the log, immediately commit the work block to Git using the phase as a prefix:
`git add . && git commit -m "[PHASE] WB-001: Brief description of economic value added"`

## Custom Commands (Hooks)
Use these scripts to execute modular skills. They handle API routing and sub-agent generation.
- `/init` -> Run `./hooks/cli_wrapper.sh /init`
- `/consume <file>` -> Run `./hooks/cli_wrapper.sh /consume <file>`
- `/analyze <node>` -> Run `./hooks/cli_wrapper.sh /analyze <node>`
- `/evaluate <theory>` -> Run `./hooks/cli_wrapper.sh /evaluate <theory>`
- `/blog <target>` -> Run `./hooks/cli_wrapper.sh /blog <target>`
- `/daily-summary` -> Run `./hooks/cli_wrapper.sh /daily-summary`
- `/bootstrap` -> Run `./skills/bootstrap.sh` (Pre-flight dependency check)
### 2\. The Low-Token Logging & Pre-flight Scripts
We need to add the flat-text logging directory and the bootstrap validation script to ensure the harness is stable before execution.
### skills/bootstrap.sh **(Environment Validator)**
Claude Code should run this first to ensure the environment is ready and the Git repo is initialized to support the commit protocol.
Bash


#!/bin/bash
# Skill: Bootstrap & Validation
# Run this via `/bootstrap` to verify harness health.

echo "Verifying Sensai Compilar Harness..."

# 1. Check Directories
mkdir -p research_body/{01_raw,02_nodes,03_archive} \
         outcomes/{theories,economic_models,broadcast} \
         skills hooks agents/logs templates
echo "[OK] Directory structure verified."

# 2. Check Git Initialization
if [ ! -d ".git" ]; then
    echo "Initializing Git repository for Work Block tracking..."
    git init
    echo "[OK] Git initialized."
else
    echo "[OK] Git repository found."
fi

# 3. Check low-token log file
LOG_FILE="agents/logs/execution.log"
if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
    echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > "$LOG_FILE"
    echo "[OK] Low-token execution log initialized."
fi

# 4. Check Dependencies & Keys
if ! command -v python3 &> /dev/null; then
    echo "[FAIL] Python3 is not installed."
    exit 1
fi

if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "[FAIL] ANTHROPIC_API_KEY is not set. Sub-agents will fail."
    echo "Please export ANTHROPIC_API_KEY to your shell."
    exit 1
fi

echo "[OK] Dependencies and environment variables validated."
echo "Harness is ready for execution."
### 3\. Final Initialization Sequence for Claude Code
To completely instantiate this remaining harness work, feed the following prompt to Claude Code. It will overwrite the legacy claude.md with the native configuration, setup the telemetry, and run the pre-flight checks.

**1.Update Configuration:**
**Prompt for Claude Code:**
Plaintext


Rename 'claude.md' to 'CLAUDE.md' (uppercase is required for native recognition). Update its contents with the new "Sensai Compilar Orchestrator" configuration, ensuring the Git Commit and Low-Token Logging Protocols are strictly included.
**2.Scaffold Telemetry:**
**Prompt for Claude Code:**
Plaintext


Remove the 'agents/tasks' directory as it is too token-heavy. Replace it with 'agents/logs'. Create 'agents/logs/execution.log' and add the header row: "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS".
**3.Create Pre-flight Validator:**
**Prompt for Claude Code:**
Plaintext


Create the script 'skills/bootstrap.sh' using the provided Bootstrap & Validation code. Make it executable (chmod +x). Add '/bootstrap' to the 'hooks/cli_wrapper.sh' case statement.
**4.Execute Validation:**
**Prompt for Claude Code:**
Plaintext


Run the '/bootstrap' command to verify the harness. If git was not initialized, execute the first commit containing all scaffolding files with the message "[INIT] WB-000: Initial harness scaffold".

With this in place, Claude Code now operates in a continuous loop: it selects a goal, runs a skill sub-agent via API, appends a lightweight 1-line string to agents/logs/execution.log (keeping its context window pristine), and commits the state to Git with a tag like [EVALUATE] WB-042.
