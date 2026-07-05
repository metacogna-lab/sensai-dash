# #Sensai Skills Building
### 1\. Task Composition & Tool Call Architecture
To ensure sub-agents don't hallucinate or drift into infinite loops, every action within Sensai Compilar operates on a strictly structured **Work Block (WB)** lifecycle.
Task composition is not conversational; it is computational.
**The Work Block Lifecycle:**
1. **Intent Declaration:** Claude Code reads /goals/active_milestones.md and declares a target.
2. **Tool Invocation (CLI Hook):** Claude Code executes a specific hook (e.g., ./hooks/cli_wrapper.sh /analyze node_014.md).
3. **Model Routing:** The router script dispatches the payload to the appropriate model tier (Haiku for speed, Sonnet for synthesis, Opus/Fable for deep architecture).
4. **Gating & Validation:** The script asserts the output (e.g., regex checks for valid frontmatter, checks directory compliance). If the gate fails, a non-zero exit code is returned, and the file is rejected.
5. **State Logging:** Upon success, a single dense string is appended to agents/logs/execution.log.
6. **State Commit:** Claude Code executes a structured Git commit [PHASE] WB-ID: Status.

⠀2. Finalized Folder Structure
Here is the complete, production-ready directory tree.
Plaintext


/sensai-compilar
├── CLAUDE.md                   # Orchestrator Configuration & native commands
├── session.md                  # Temporal State & Context Tracker
├── SKILL.md                    # Standard operating procedure for modular skills
├── README.md                   # Project overview and architectural blueprint
├── /goals                      # 🎯 Source of Truth
│   ├── primary_directive.md
│   └── active_milestones.md
├── /research_body              # 📚 The Fuel (Quarantined)
│   ├── /01_raw
│   ├── /02_nodes
│   └── /03_archive
├── /outcomes                   # 💰 The Value (Monetization & IP)
│   ├── /theories
│   ├── /economic_models
│   └── /broadcast
├── /skills                     # ⚙️ Sub-Agent Execution Modules
│   ├── api_wrapper.py
│   ├── router.sh
│   ├── consume.sh
│   ├── analyze.sh
│   ├── evaluate.sh
│   ├── blog.sh
│   ├── daily_summary.sh
│   └── bootstrap.sh
├── /hooks                      # 🔗 CLI Interceptors
│   └── cli_wrapper.sh
├── /agents                     # 📡 Telemetry
│   └── /logs
│       └── execution.log
└── /templates                  # 📝 Progressive Disclosure Schemas
    ├── standard_node.md
    └── daily_audit.md
### 3\. TheSKILL.md Standard
This file dictates how Claude Code (or any engineer) must construct new modular skills. It ensures the system scales predictably.
Markdown


# Sensai Compilar: Modular Skill Standard

Every new script added to `/skills` must adhere to this strict interface. Modular skills act as the nervous system connecting raw data to model APIs.

## 1. Structural Requirements
- ****Language:**** Bash (`.sh`) or Python (`.py`).
- ****Idempotency:**** Running a skill twice on the same input must not corrupt the state.
- ****Isolation:**** A skill reads from exactly one directory layer and writes to exactly one directory layer. Never mix raw inputs with outcomes.

## 2. Standard Variables & I/O
Every bash skill must implement these parameters:
- `$1`: Target input identifier (file path or entity ID).
- `SYS_PROMPT`: The hardcoded metacognitive directive for the sub-agent.
- `USER_PROMPT`: The assembled payload (context + raw text).
- `OUTPUT_FILE`: The designated destination adhering to `[type]_[timestamp].md`.

## 3. Mandatory Gating
A skill must never fail silently. Implement a strict gate before saving output:
1\. Verify the API returned a payload.
2\. Verify the output contains the required Progressive Disclosure frontmatter.
3\. If validation fails, return `exit 1`, delete the malformed output, and echo the failure reason to standard error.

## 4. Hook Registration
When a new skill is created, it must be bound to a command interceptor in `/hooks/cli_wrapper.sh`. Do not allow naked script executions outside of the hook lifecycle.
### 4\. The Initialization Prompt
Copy this block and feed it directly to Claude Code. It instructs the agent to read the spec, build the scaffolding, and prime the system for the final README.md.
Plaintext


You are Sensai Compilar, an expert Agentic Orchestrator. We are initializing your kinetic value-generation harness. Execute the following Work Blocks sequentially.

1\. Build the Directory Tree: 
Run standard bash commands to create the following directories in this workspace: `goals`, `research_body/01_raw`, `research_body/02_nodes`, `research_body/03_archive`, `outcomes/theories`, `outcomes/economic_models`, `outcomes/broadcast`, `skills`, `hooks`, `agents/logs`, and `templates`.

2\. Initialize Telemetry:
Create `agents/logs/execution.log` and insert the header: "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS".

3\. Establish the Skill Standard:
Create `SKILL.md` in the root directory. Document the strict requirements for modular skills: Idempotency, Input/Output isolation (never mixing raw data with outcomes), Mandatory Gating (exit 1 on failed frontmatter validation), and Hook Registration.

4\. Anchor the Goals:
Create `goals/primary_directive.md`. State the core objective: "Transform raw research into concrete computational software models and economic value. No endless academic abstraction." Create `goals/active_milestones.md` with a placeholder list for the first sprint.

5\. Halt and Report:
Once directories, telemetry, SKILL.md, and goals are created, stop execution. Output a confirmation that the harness scaffolding is complete and await the README.md specification.
## *Pause: The following is the*README.md content to be written to the root directory after initialization.
### 5\.README.md
Markdown


# Sensai Compilar

Sensai Compilar is an agentic, metacognitive value-generation engine orchestrated by Claude Code. It is designed to act as a one-way valve: taking raw research, academic frameworks, and social dynamics theories, and ruthlessly distilling them into deployable software architecture and economic models.

## Architectural Ethos
- ****Kinetic Action over Static Storage:**** This is not a wiki. Research is treated as raw fuel. If a node does not map to a theory, and a theory does not map to an economic model, the pipeline is blocked.
- ****Strict Compartmentalization:**** Raw data (`/research_body`) is mechanically isolated from value outcomes (`/outcomes`).
- ****Progressive Disclosure:**** All generated Markdown follows a strict hierarchy—from high-level executive summaries to deep context matrices. 

## The Core Pipeline States
1\. ****CONSUME (Haiku):**** Ingest raw papers/transcripts, strip noise, and format into structured Nodes.
2\. ****ANALYZE (Sonnet):**** Synthesize cross-referenced Nodes into formal Theory documents.
3\. ****EVALUATE (Opus/Fable):**** Force Theories through an economic lens to generate IP boundaries, product specs, and monetization vectors.
4\. ****BROADCAST (Haiku/Sonnet):**** Translate mature models into external market presence.

## Operator Instructions
The entire system is driven via CLI hooks managed by the orchestrator. 

* `/init` - Scaffold and baseline the current session.
* `/consume <target>` - Trigger ingestion.
* `/analyze <node>` - Trigger synthesis.
* `/evaluate <theory>` - Trigger economic extraction.
* `/daily-summary` - Execute an alignment audit to detect cognitive drift.

****System Tracker:****
Current state, active milestones, and sub-agent tasking are maintained autonomously in `session.md` and the low-token ledger at `agents/logs/execution.log`.
