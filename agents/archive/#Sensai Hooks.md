# #Sensai Hooks

Here is the exact CLI command specification for the **Sensai Mission Control** /hooks routing system.
To enable seamless multi-engagement capabilities without context bleed, the system uses a pointer file (/system/.active_engagement) to lock the bash scripts to a specific directory within /engagements/. Claude Code manages this state via the /switch command.
### 1\. Engagement Context Management
Before executing pipeline tasks, Claude Code must ensure it is operating in the correct contextual silo. The CLI wrapper enforces this by checking the active pointer.
### /switch [engagement_name]
* **Purpose:** Changes the active tenant workspace.
* **Arguments:** engagement_name (string, snake_case, no spaces).
* **Behavior:**
  1. Checks if /engagements/[engagement_name] exists.
  2. If true, writes the name to /system/.active_engagement.
  3. Outputs the session.md summary of the newly active engagement to prime Claude Code's context.
* **Standard Output:** [SUCCESS] Context switched to [engagement_name]. Active Milestones: ...
* **Failure Output:** [ERROR] Engagement not found. Use /init [engagement_name] to create.

⠀/init [engagement_name]
* **Purpose:** Scaffolds a new, isolated project space.
* **Arguments:** engagement_name (string, snake_case).
* **Behavior:** Creates the full /research_body, /outcomes, /goals, and /agents directory trees within /engagements/[engagement_name]. Automatically triggers a /switch to this new engagement.
* **Standard Output:** [SUCCESS] Initialized and switched to [engagement_name].

⠀2. The Value Pipeline Commands
All pipeline commands are routed through /system/hooks/cli_wrapper.sh. They automatically inherit the BASE_PATH from the .active_engagement pointer.
### /consume [filename]
* **Purpose:** Ingests raw data.
* **Arguments:** filename (Must exist in <active_engagement>/research_body/01_raw/).
* **Security:** Script aggressively strips ../ to prevent reading outside the active 01_raw folder.
* **Behavior:** Triggers Haiku. Formats to Node. Moves filename to 03_archive.
* **Standard Output:** [SUCCESS] Consumed [filename] -> node_[timestamp].md
* **Failure Output (Exit 1):** [FAIL] Gating Error: Frontmatter schema invalid.

⠀/analyze [node_id]
* **Purpose:** Synthesizes theories.
* **Arguments:** node_id (e.g., node_1715420000.md).
* **Behavior:** Triggers Sonnet. Reads from 02_nodes, outputs to outcomes/theories/.
* **Standard Output:** [SUCCESS] Analyzed [node_id] -> theory_[timestamp].md

⠀/evaluate [theory_id]
* **Purpose:** Extracts economic/system value.
* **Arguments:** theory_id (e.g., theory_1715421000.md).
* **Behavior:** Triggers Opus/Fable. Evaluates against /goals/primary_directive.md. Outputs to outcomes/economic_models/.
* **Standard Output:** [SUCCESS] Evaluated [theory_id] -> econ_[timestamp].md

⠀/blog [source_file]
* **Purpose:** Generates dissemination assets.
* **Arguments:** source_file (Can be a theory or econ model ID).
* **Behavior:** Triggers Haiku. Translates deep context into broadcast materials.
* **Standard Output:** [SUCCESS] Broadcast material generated -> post_[timestamp].md

⠀/daily-summary
* **Purpose:** Alignment audit for the active engagement.
* **Arguments:** None.
* **Behavior:** Compiles all lines from <active_engagement>/agents/logs/execution.log generated in the last 24 hours. Sonnet evaluates them against local /goals/primary_directive.md.
* **Standard Output:** [SUCCESS] Audit complete. Output written to broadcast/audit_[date].md

⠀3. The Central Hook Implementation (cli_wrapper.sh)
This is the exact code for /system/hooks/cli_wrapper.sh that enforces multi-tenancy and standardizes output for Claude Code to parse.
Bash


### #!/bin/bash
### # Sensai Mission Control: Central CLI Interceptor

### COMMAND=$1
### TARGET=${2//..\//} # Security: Strip path traversal attempts

### ACTIVE_PTR="./system/.active_engagement"

### # --- Context Management Commands ---
### if [ "$COMMAND" == "/switch" ]; then
###     if [ -d "./engagements/$TARGET" ]; then
###         echo "$TARGET" > "$ACTIVE_PTR"
###         echo "[SUCCESS] Context switched to $TARGET."
###         cat "./engagements/$TARGET/session.md" | head -n 10
###         exit 0
###     else
###         echo "[ERROR] Engagement '$TARGET' not found."
###         exit 1
###     fi
### fi

### if [ "$COMMAND" == "/init" ]; then
###     ENG_PATH="./engagements/$TARGET"
###     mkdir -p "$ENG_PATH"/{goals,research_body/{01_raw,02_nodes,03_archive},outcomes/{theories,economic_models,broadcast},agents/logs}
###     echo "TIMESTAMP | PHASE | WORK_BLOCK | TARGET | STATUS" > "$ENG_PATH/agents/logs/execution.log"
###     echo "$TARGET" > "$ACTIVE_PTR"
###     echo "[SUCCESS] Initialized and switched to $TARGET."
###     exit 0
### fi

### # --- Pipeline Execution Commands ---
### # Ensure a context is set before running pipeline tools
### if [ ! -f "$ACTIVE_PTR" ]; then
###     echo "[ERROR] No active engagement. Run /switch [name] first."
###     exit 1
### fi

### ACTIVE_ENGAGEMENT=$(cat "$ACTIVE_PTR")
### BASE_PATH="./engagements/$ACTIVE_ENGAGEMENT"
### export SENSIA_BASE_PATH="$BASE_PATH" # Export for modular skills to use

### case $COMMAND in
###     "/consume")
###         ./system/skills/consume.sh "$TARGET"
###         ;;
###     "/analyze")
###         ./system/skills/analyze.sh "$TARGET"
###         ;;
###     "/evaluate")
###         ./system/skills/evaluate.sh "$TARGET"
###         ;;
###     "/blog")
###         ./system/skills/blog.sh "$TARGET"
###         ;;
###     "/daily-summary")
###         ./system/skills/daily_summary.sh
###         ;;
###     *)
###         echo "[ERROR] Unknown command: $COMMAND"
###         exit 1
###         ;;
### esac
### 4\. Claude Code Standard Out/Err Protocol
To ensure Claude Code operates deterministically, it must be instructed in its CLAUDE.md on how to interpret standard output and standard error from the /hooks.
**Add this instruction to CLAUDE.md:**
**CLI Response Interpretation:**
* When you execute a /hook, monitor the STDOUT string.
* If STDOUT begins with [SUCCESS], the gating succeeded. Append this success to agents/logs/execution.log and execute your git commit Work Block.
* If STDOUT begins with [ERROR] or [FAIL], the computational gate rejected your action (e.g., malformed schema, missing file). **DO NOT commit this to the timeline.** Read the failure reason, self-correct your assumptions, and attempt the block again.

