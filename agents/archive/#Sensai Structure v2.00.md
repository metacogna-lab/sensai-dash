# #Sensai Structure v2.00

Here is the finalized architecture, incorporating the /goals directory as the immutable source of truth to anchor the agent's alignment.
I have packaged this into a single init.md payload. You can drop this exact text file into an empty directory, point Claude Code at it, and tell it: *"Execute the instructions in init.md"*.
It contains the strict directory scaffolding, the source-of-truth initialization, and the commands to bootstrap the harness.
### The Finalized Folder Structure
*This is what Claude Code will build upon consuming the init file.*
Plaintext


/sensai-compilar
├── CLAUDE.md                   # Orchestrator Configuration & Hooks
├── session.md                  # Temporal State & Context Tracker
├── init.md                     # This bootstrap file
├── /goals                      # 🎯 Source of Truth (Alignment & Objectives)
│   ├── primary_directive.md    # Core economic/research mission
│   └── active_milestones.md    # Current sprint/block targets
├── /research_body              # 📚 The Fuel (Quarantined)
│   ├── /01_raw                 # Unprocessed papers, notes, data
│   ├── /02_nodes               # Formatted entity/concept extractions
│   └── /03_archive             # Depleted inputs
├── /outcomes                   # 💰 The Value (Monetization & IP)
│   ├── /theories               # Synthesized frameworks
│   ├── /economic_models        # Product specs, IP models, pricing
│   └── /broadcast              # Dissemination & social media
├── /skills                     # ⚙️ Sub-Agent Execution Modules
│   ├── api_wrapper.py          # Anthropic API payload handler
│   ├── router.sh               # Sub-agent model router
│   ├── consume.sh              # Haiku ingestion skill
│   ├── analyze.sh              # Sonnet theory synthesis skill
│   ├── evaluate.sh             # Opus/Fable economic modeling skill
│   ├── blog.sh                 # Broadcast generation skill
│   ├── daily_summary.sh        # Alignment audit skill
│   └── bootstrap.sh            # Pre-flight environment check
├── /hooks                      # 🔗 CLI Interceptors
│   └── cli_wrapper.sh          # Handles native /commands
├── /agents                     # 📡 Telemetry
│   └── /logs
│       └── execution.log       # Low-token, flat-text work block ledger
└── /templates                  # 📝 Progressive Disclosure Schemas
    ├── standard_node.md
    └── daily_audit.md
### Theinit.md Payload
Save the following block as init.md in your empty project directory.
Markdown


# Sensai Compilar: Harness Initialization Directives

****To Claude Code:**** You are Sensai Compilar. You are tasked with bootstrapping your own agentic harness. Execute the following phases sequentially. Do not skip steps. Log your progress.

## Phase 1: Structural Scaffolding
Run the following bash commands to establish the directory tree:
```bash
mkdir -p goals research_body/{01_raw,02_nodes,03_archive} outcomes/{theories,economic_models,broadcast} skills hooks agents/logs templates
## Phase 2: Source of Truth Initialization
Create the core alignment files inside /goals. These dictate your purpose.
1. Create goals/primary_directive.md with the following content: **Directive:** Transform raw research and social dynamics frameworks into concrete computational software models and economic value. Avoid endless academic abstraction. Every theory must yield a product, system design, or monetization vector. 
2. Create goals/active_milestones.md with a markdown checklist of the first 3 tasks: Setup harness, ingest first raw data batch, synthesize baseline theory.

⠀Phase 3: Telemetry Initialization
Initialize the low-token execution log to keep your context window clean.
Bash


touch agents/logs/execution.log
echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > agents/logs/execution.log
## Phase 4: Core File Generation
Generate the core configuration files in the root directory:
1. CLAUDE.md: Define your system prompt, the Work Block execution rules, the requirement to append to agents/logs/execution.log after every task, and map the custom commands (/consume, /analyze, /evaluate, /daily-summary) to the hooks/cli_wrapper.sh script.
2. session.md: Initialize the active session state, setting active sub-agents to 0 and linking to the goals/active_milestones.md.

⠀Phase 5: Executable Bootstrapping
1. Write the core skill scripts into the /skills directory (router.sh, api_wrapper.py, bootstrap.sh, etc.) based on standard Sensai Compilar architecture.
2. Write the /hooks/cli_wrapper.sh to route commands to the skills.
2. Make all scripts executable:

⠀Bash


chmod +x skills/*.sh hooks/*.sh skills/api_wrapper.py
## Phase 6: Git & Pre-flight
1. Initialize the git repository (git init).
2. Run the bootstrap script (./skills/bootstrap.sh) to verify dependencies and environment variables (like ANTHROPIC_API_KEY).
2. Commit the initialized harness:

⠀Bash


git add .
git commit -m "[INIT] WB-000: Sensai Compilar harness scaffolded and verified"
echo "$(date '+%Y-%m-%d %H:%M:%S') | INIT | WB-000 | Harness | SUCCESS" >> agents/logs/execution.log
**Completion Trigger:** Once Phase 6 is complete, output a system readiness message and await your first /consume command.
