# #Sensai Skills Mapper
To move **Sensai Mission Control** from a script-runner to a truly self-correcting agentic harness, we need rigorous evaluation loops (Evals) and a transparent execution trail.
When agents spawn sub-agents blindly, context drifts and costs spiral. We prevent this by forcing every sub-agent to register its intent, execution logs, and outputs in an immutable paper trail under agents/tasks/.
## 1\. Guiding Evals & Harness Elements
An engine without telemetry is just code running in the dark. We implement two tiers of evaluation: **Structural Assertions** (deterministic checks) and **Alignment Evals** (LLM-as-a-Judge).
### The Evaluation Matrix
| **Evaluation Target** | **Method** | **Success Criteria** | **Failure Action** |
|---|---|---|---|
| **Ingestion Density** | Deterministic (Regex) | Frontmatter complete; Noise ratio dropped by greater than 50% | Quarantine raw input; flag for manual schema check |
| **Theoretical Drift** | LLM-as-a-Judge (Sonnet) | Cross-reference new theory with existing graph; variance score less than 3/10 | Reject merge; append contradiction log to session.md |
| **Economic Actionability** | LLM-as-a-Judge (Opus) | Must include explicit pricing model, IP boundaries, or clear build steps | Return to Forge; request specific monetization vector |
### Operationalizing the Harness
Every time a skill script runs, it runs an internal assertion pass. For example, before evaluate.sh saves an economic model, it pipes the output through a judge prompt. If the judge returns FAIL, the file is dropped, preventing junk data from polluting the /outcomes cache.
## 2\. Claude Code Project Initialization Sequence
Feed this sequence of prompts directly to Claude Code to bootstrap the entire system from scratch. This sequence explicitly enforces the decoupled task architecture.

**1.Phase 1: Blueprint Scaffolding:**Execute in target workspace root.
**Prompt for Claude Code:**
Plaintext


Create the system directory tree for Project Sensai Mission Control. Ensure the following structure is completely built out:
mkdir -p research_body/{01_raw,02_nodes,03_archive} outcomes/{theories,economic_models,broadcast} skills hooks agents/tasks templates
**2.Phase 2: Master Controller Generation:**Establishes rules and baseline state.
**Prompt for Claude Code:**
Plaintext


Write the master orchestrator file 'claude.md' and the temporal state tracker 'session.md' in the project root based on the core architecture. Ensure 'claude.md' contains the progressive disclosure markdown layout rules, and 'session.md' initializes with 0 active sub-agents and a 'quarantine-verified' raw data status.
**3.Phase 3: Task Ledger Architecture:**Forces atomic execution logging.
**Prompt for Claude Code:**
Plaintext


Create a template file inside 'templates/task_ledger.md'. This template will govern every sub-agent task spawned. It must contain fields for: Timestamp, Parent Task ID, Executing Model, Core Intent, Inputs Consumed, Outputs Generated, and an Eval Validation Pass status.
**4.Phase 4: Executable Skill Assembly:**Injects the Python API and Bash scripts.
**Prompt for Claude Code:**
Plaintext


Write the fully functional 'skills/api_wrapper.py', 'skills/router.sh', 'skills/consume.sh', 'skills/analyze.sh', 'skills/evaluate.sh', and 'skills/blog.sh' files. Ensure all scripts are fully documented, capture errors cleanly, and use 'agents/tasks/[TIMESTAMP]_[AGENT_ID]_[TASK].md' to record their execution footprint before completing. Make all scripts executable using chmod +x.

## 3\. The/daily-summary Alignment Engine
To keep work tightly aligned with economic outcomes, the /daily-summary hook calculates delta-value: it scans the daily output logs, flags deviation from the core targets defined in claude.md, and surfaces cognitive blockers.
### Implementing the Summary Skill:skills/daily_summary.sh
Bash


#!/bin/bash
# Skill: Daily Summary & Drift Detection

SUMMARY_FILE="./outcomes/broadcast/summary_$(date +%Y-%m-%d).md"
CURRENT_DATE=$(date +%Y-%m-%d)

echo "Gathering daily execution logs for $CURRENT_DATE..."

# Collate all tasks executed today into a temporary buffer
LOG_BUFFER=""
if [ -d "./agents/tasks" ]; then
    for f in ./agents/tasks/*; do
        # Extract files matching today's date prefix
        if [[ $(basename "$f") == *"$CURRENT_DATE"* ]]; then
            LOG_BUFFER+="$(cat "$f")\n---\n"
        fi
    done
fi

if [ -z "$LOG_BUFFER" ]; then
    echo "No sub-agent tasks recorded today."
    LOG_BUFFER="No tasks executed on $CURRENT_DATE."
fi

GOALS_CONTEXT=$(cat claude.md | grep -A 20 "## Operating Principles")
SESSION_CONTEXT=$(cat session.md)

# Prepare the prompt for Sonnet to parse alignment
SYS_PROMPT="You are the Auditor of Sensai Mission Control. Compare today's work logs against the system's operational goals and current session constraints. Identify where the agents wasted resources, where theories drifted from economic monetization, and generate exactly 3 critical questions the engineer must answer to get back on track."

USER_PROMPT="### Operational Goals:\n$GOALS_CONTEXT\n\n### Current Session State:\n$SESSION_CONTEXT\n\n### Executed Logs:\n$LOG_BUFFER"

# Route to Sonnet for precise alignment audit
./skills/router.sh "sonnet" "$SYS_PROMPT" "$USER_PROMPT" "$SUMMARY_FILE"

echo "Daily Alignment Audit complete: $SUMMARY_FILE"
### Map the Command Hook
Add the execution case to your main command interceptor (hooks/cli_wrapper.sh):
Bash


    "/daily-summary")
        ./skills/daily_summary.sh
        ;;
### Standard Output Matrix of the Audit
When you trigger /daily-summary, the resulting markdown file is structured to highlight friction instantly:
Markdown


---
status: review-required
type: audit
timestamp: 2026-07-04T22:15:00
---
# Daily Alignment Audit: 2026-07-04

> ****TL;DR:**** Research velocity is high, but economic vectors are slipping into pure academic abstraction.

## 1. Velocity vs. Alignment
* ****Tasks Logged:**** 7 sub-agent invocations today.
* ****Goal Deviations:**** `Agent_1467_Consume` ingested 3 papers on adjacent social dynamics frameworks, but no corresponding entries were pushed to `/outcomes/economic_models`. 

## 2. Identified Drift
> ****Warning:**** The system spent 42% of its compute footprint analyzing historical context notes rather than hardening the active core theory.

## 3. Hard Questions to Answer
1\. Why are we prioritizing the parsing of legacy academic papers over drafting the product spec for the primary monetization vector?
2\. Does the current theory variant actually support multi-tenant deployment, or are we designing an unscalable system?
3\. What is the explicit economic value of holding data nodes that haven't been evaluated in the last 72 hours?
Now, Claude Code has the capability to spin up isolated workers, verify their output structures deterministically, and audit itself at the end of every cycle to ensure no time is spent on zero-value research loops.



