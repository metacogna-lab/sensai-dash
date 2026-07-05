# #Sensai Compiler Outline v1.00
Here is the execution layer for **Sensai Compilar**.
To achieve modular sub-agent spawning and strict model routing, we will implement a central bash-based router. This router acts as the nervous system, dispatching API calls to the specific models (Haiku, Sonnet, Opus, Fable) based on the cognitive load of the task.
We will also establish session.md to track the temporal state of your pipeline, ensuring Claude Code has a persistent memory of active sub-agents and pipeline progress.
### 1\. The Session Tracker:session.md
Place this in the root of the project. While claude.md holds the *rules*, session.md holds the *state*. Claude Code should read this upon waking and update it before sleeping.
Markdown


---
status: active
current*_focus: [Insert active theory or ingestion target]
active_*sub*_agents: [0]
last_*checkpoint: 2026-07-04T22:10:57
---
# Sensai Compilar: Session State

> ****TL;DR:**** [One-sentence summary of the current economic objective]

## 1. Pipeline Status
| Phase | Model | Queue | Completed | Blockers |
| :--- | :--- | :--- | :--- | :--- |
| ****Consume**** | Haiku | 3 Raw Files | 12 Nodes | None |
| ****Analyze**** | Sonnet | 2 Nodes | 4 Theories | Synthesis loop requires manual review |
| ****Evaluate**** | Opus/Fable | 1 Theory | 1 Econ Model | Awaiting market sizing data |
| ****Broadcast**** | Haiku | 0 Triggers | 5 Blogs | None |

## 2. Active Sub-Agents (Spawned Tasks)
- [ ] ****Agent 001 (Sonnet):**** Mapping cross-references between Node*_A and Node_*B. (Status: Running)
- [ ] ****Agent 002 (Haiku):**** Summarizing raw transcript `interview_04.txt`. (Status: Pending)

## 3. Raw Data Quarantine Log
**Strict enforcement: Raw data has been verified as completely isolated from /outcomes.**
- Last ingestion: `/research_body/01_raw/paper_v3.pdf` -> Extracted to `/02_nodes/node_014.md`
### 2\. Core Routing & Hooks
This is the central execution framework. It defines how skills are routed to specific models and how raw data is handled.
### skills/router.sh **(The Sub-Agent & Model Router)**
This script manages the API payloads and model delegation.
Bash


#!/bin/bash
# Sensai Compilar: Central Model Router
# Usage: ./router.sh <model_class> <system_prompt> <user_prompt> <output_file>

MODEL_CLASS=$1
SYSTEM_PROMPT=$2
USER_PROMPT=$3
OUTPUT_FILE=$4

# Route to the appropriate model based on cognitive load requirements
case $MODEL_CLASS in
    "fable")
        # Fable: Complex planning, DAG creation, architecture
        API_MODEL="claude-3-5-sonnet-20241022" # Note: Mapping Fable capability to latest Sonnet/Opus equivalent
        MAX_TOKENS=8192
        ;;
    "opus")
        # Opus: Deep evaluation, economic synthesis
        API_MODEL="claude-3-opus-20240229"
        MAX_TOKENS=4096
        ;;
    "sonnet")
        # Sonnet: Standard analysis, alignment
        API_MODEL="claude-3-5-sonnet-20241022"
        MAX_TOKENS=4096
        ;;
    "haiku")
        # Haiku: Rapid ingestion, formatting
        API_MODEL="claude-3-haiku-20240307"
        MAX_TOKENS=2048
        ;;
    *)
        echo "Error: Unknown model class. Use fable, opus, sonnet, or haiku."
        exit 1
        ;;
esac

echo "Spawning sub-agent routing to $API_MODEL..."

# Mocking the actual curl payload for the API call
# In production, use your preferred CLI tool (e.g., standard Anthropic curl or a python wrapper)
python3 ./skills/api_wrapper.py "$API_MODEL" "$SYSTEM_PROMPT" "$USER_PROMPT" "$MAX_TOKENS" > "$OUTPUT_FILE"

echo "Sub-agent complete. Output written to $OUTPUT_FILE"
### hooks/cli_wrapper.sh **(Command Interceptor)**
This script allows Claude Code to use the / commands you specified.
Bash


#!/bin/bash
# CLI Wrapper for Sensai Compilar commands

COMMAND=$1
TARGET=$2

case $COMMAND in
    "/init")
        echo "Initializing Sensai Compilar workspace..."
        mkdir -p research_body/{01_raw,02_nodes,03_archive} outcomes/{theories,economic_models,broadcast} skills templates
        ./skills/router.sh "fable" "You are a master planner." "Map the research horizon based on current session." "session.md"
        ;;
    "/consume")
        ./skills/consume.sh "$TARGET"
        ;;
    "/analyze")
        ./skills/analyze.sh "$TARGET"
        ;;
    "/evaluate")
        ./skills/evaluate.sh "$TARGET"
        ;;
    "/blog")
        ./skills/blog.sh "$TARGET"
        ;;
    *)
        echo "Unknown command. See claude.md for available hooks."
        ;;
esac
### 3\. Modular Skills
Here are the specific scripts that enforce the raw-to-processed boundary and execute the pipeline phases.
### skills/consume.sh **(Haiku: The Void)**
Enforces raw data quarantine. Reads from 01_raw, processes it, and writes clean markdown to 02_nodes.
Bash


#!/bin/bash
# Skill: Consume (Raw -> Node)

RAW_FILE="./research_body/01_raw/$1"
NODE_FILE="./research_body/02_nodes/node_$(date +%s).md"

if [ ! -f "$RAW_FILE" ]; then
    echo "Error: Raw file not found."
    exit 1
fi

echo "Ingesting raw data: $RAW_FILE"
RAW_CONTENT=$(cat "$RAW_FILE")

SYS_PROMPT="You are a data ingestion agent. Extract core entities, theories, and concepts. Output strictly in the Progressive Disclosure Markdown format. Discard all noise."

# Route to Haiku for rapid processing
./skills/router.sh "haiku" "$SYS_PROMPT" "$RAW_CONTENT" "$NODE_FILE"

# Gating: Verify the node was created and contains the frontmatter
if grep -q "status:" "$NODE_FILE"; then
    echo "Node successfully generated: $NODE_FILE"
    # Quarantine the raw file to the archive so it isn't re-processed
    mv "$RAW_FILE" "./research_body/03_archive/"
else
    echo "Gating Failed: Haiku did not format the node correctly. Deleting."
    rm "$NODE_FILE"
fi
### skills/evaluate.sh **(Opus: The Forge)**
Extracts economic value from synthesized theories.
Bash


#!/bin/bash
# Skill: Evaluate (Theory -> Economic Model)

THEORY_FILE="./outcomes/theories/$1"
ECON_FILE="./outcomes/economic_models/econ_$(date +%s).md"

if [ ! -f "$THEORY_FILE" ]; then
    echo "Error: Theory file not found."
    exit 1
fi

THEORY_CONTENT=$(cat "$THEORY_FILE")

SYS_PROMPT="You are a merciless economic evaluator. Review this theory and output a concrete monetization vector, product spec, or IP model. Use the standard markdown format."

# Route to Opus for deep reasoning and value generation
./skills/router.sh "opus" "$SYS_PROMPT" "$THEORY_CONTENT" "$ECON_FILE"

if grep -q "type: economic_model" "$ECON_FILE"; then
    echo "Economic Model successfully forged: $ECON_FILE"
else
    echo "Gating Failed: Failed to produce a viable economic model."
fi
