# #Sensai PRD v1.00

# Product Requirements Document: Sensai Mission Control Engine
**Document Status:** Baseline / Active
**Target Architecture:** Claude Code Native + Deterministic Shell Harness
**Core Mandate:** Compile abstract research into deterministic economic value.
# 1\. Executive Vision
Sensai Mission Control is not a conversational AI tool; it is a defense-grade, metacognitive value-generation compiler. It bridges the probabilistic nature of Large Language Models with the strict, deterministic requirements of systems engineering. Orchestrated entirely by Claude Code, the harness treats research, social dynamics theories, and open-source intelligence as raw kinetic fuel.
Through a strictly gated state machine, it refines this fuel into deployable software architectures, economic models, and strategic assets. The system must natively support **multi-tenant engagements**—allowing parallel processing of distinct domains (e.g., social dynamics modeling, OSINT tactical platforms, legal routing systems) without context bleed.
# 2\. Core Operating Principles
* **Agentic Determinism:** Sub-agents (Haiku, Sonnet, Opus) perform the cognitive labor, but the *gates* between states are strictly computational (regex schema validation, zero-exit-code bash enforcement). If an LLM hallucinates a format, the system rejects it rather than corrupting the pipeline.
* **Contextual Quarantine (Shunyata):** Raw data is inherently noisy. It must be strictly isolated from synthesized theories and economic outputs. The orchestrator's context window is kept violently clean.
* **Modular Multi-Tenancy:** The harness acts as a centralized brain routing generalized skills across isolated, engagement-specific storage vectors.
* **Progressive Disclosure:** All outputs adhere to a strict markdown schema, offering front-matter metadata, executive summaries, and deep technical weeds.

⠀3. Multi-Engagement Architecture & File Topology
To support multiple discrete projects within the same Claude Code orchestration environment, the architecture splits **System Logic** from **Engagement State**.
Plaintext


### /sensai-compilar
### ├── CLAUDE.md                   # Master Orchestrator Directive (The Sensai)
### ├── SKILL.md                    # Sub-agent development SOP
### ├── README.md                   # System blueprint
### │
### ├── /system                     # ⚙️ Deterministic Logic & Tooling (Global)
### │   ├── /skills                 # Executable scripts (consume.sh, evaluate.sh)
### │   ├── /hooks                  # CLI interceptors for Claude Code (/commands)
### │   ├── /templates              # Markdown and JSON schema definitions
### │   └── /router                 # Python API wrappers and model load-balancers
### │
### └── /engagements                # 📂 Isolated Context Spaces (Multi-Tenant)
###     ├── /project_compilar       # Example Engagement A
###     │   ├── session.md          # Local state tracker
###     │   ├── /goals              # Local alignment and milestones
###     │   ├── /agents/logs        # Local execution.log (low-token telemetry)
###     │   ├── /research_body      # 01_raw, 02_nodes, 03_archive
###     │   └── /outcomes           # theories, economic_models, broadcast
###     │
###     └── /project_shaivra        # Example Engagement B
###         ├── session.md
###         ├── /goals
###         ├── /agents/logs
###         ├── /research_body
###         └── /outcomes
# 4\. Product Requirements & Features
### 4.1 Orchestration Layer (Claude Code Integration)
**Requirement:** Claude Code must operate as the autonomous master orchestrator, interacting with the system exclusively through CLI hooks and Work Blocks.
* **Context Management:** Claude Code must rely on the low-token execution.log within the active engagement to understand temporal state, rather than re-reading the entire project directory.
* **Atomic Work Blocks:** Every action is a discrete [PHASE] WB-ID. Claude Code must initiate a task, run a tool, evaluate the exit code, log the result, and git commit the block.
* **Engagement Context Switching:** A /switch <engagement_name> command must allow Claude Code to re-anchor its working directory and active session.md to a different project seamlessly.

⠀4.2 The Deterministic Gating Engine
**Requirement:** The transition of data from /research_body to /outcomes must be computationally verified. Probabilistic LLM outputs must be coerced into deterministic formats.
* **Frontmatter Assertions:** Scripts must use grep and awk to verify that generated markdown contains the required YAML-style frontmatter (status, type, tags) before saving.
* **Type Enforcement:** If an economic model is generated, the deterministic gate must verify the presence of mandatory headers (e.g., ## Economic Vector, ## System Architecture).
* **Fail-Safe Deletion:** If an API call fails or the output violates the schema, the script must return a non-zero exit code (exit 1), delete the malformed file, and report the specific failure to Claude Code for autonomous correction.

⠀4.3 The State Machine Pipeline
**Requirement:** Data must flow in one direction through four distinct phases, powered by designated modular skills.
| **Phase** | **Model Tier** | **Core Function** | **Computational Gate** |
|---|---|---|---|
| **1\. Consume** | Haiku | Ingest raw data, extract entities, format to Nodes. | Valid schema? Noise reduction > 50%? |
| **2\. Analyze** | Sonnet | Synthesize Nodes into formal Theory vectors. | Cross-reference valid against /goals? |
| **3\. Evaluate** | Opus / Fable | Compile Theories into product/economic architectures. | Contains actionable monetization/build steps? |
| **4\. Broadcast** | Haiku | Generate external market presence (blogs, social). | Output non-empty? Formatted for distribution? |
### 4.4 Telemetry and Alignment Audits
**Requirement:** The system must proactively detect cognitive drift and misaligned research loops.
* **Low-Token Logging:** All executions append exactly one line to agents/logs/execution.log (e.g., TIMESTAMP | PHASE | TARGET | STATUS).
* **Daily Alignment Audit:** The /daily-summary tool parses the logs against the primary_directive.md using LLM-as-a-judge, outputting a rigid anomaly report containing exactly three questions the operator must answer to restore alignment.

⠀5. Security & Isolation
* **API Key Management:** API tokens must be sourced from the local environment variables. Scripts must fail gracefully if ANTHROPIC_API_KEY is missing.
* **Path Traversal Prevention:** The router and skill scripts must strip path traversal characters (../) from input arguments to ensure an engagement cannot read or write to another engagement's directory space.
* **Data Quarantine:** Raw input data is considered untrusted and unstructured. Once successfully consumed into a Node, it is moved to /03_archive to prevent redundant compute cycles.

⠀



