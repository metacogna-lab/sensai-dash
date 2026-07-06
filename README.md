# 🧠 Sensai Mission Control

**An agentic research-and-development pipeline that transforms raw research into verified strategic deliverables.**

Sensai Mission Control is a Claude Code-native system that takes PDFs, papers, transcripts, and notes and ruthlessly distills them into:
- **Verified theories** backed by source material
- **Economic models** with concrete monetization vectors
- **Strategic alignment documents** with step-by-step execution plans
- **Verified insights** stress-tested against the original corpus

It combines a **13-phase automated pipeline** with **human-in-the-loop decision points**, guided by Claude agents using the Fable Interaction methodology.

---

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/sensai-org/sensai-finder.git
cd sensai-finder
```

### 2. Install Claude Code

If you don't have Claude Code installed yet:

```bash
# Via Homebrew (macOS)
brew install anthropics/tap/claude

# Via npm
npm install -g @anthropic-ai/claude

# Or download from: https://claude.ai/code
```

### 3. Launch Claude Code

```bash
claude
```

This opens Claude Code in your terminal, ready to orchestrate the pipeline.

### 4. See It In Action

For a complete walkthrough of the system:

```
📖 Open: EXAMPLE.md
```

This guide walks you through a real end-to-end example:
- Initializing a research engagement
- Extracting and consuming sources
- Running analysis and synthesis
- Producing verified deliverables

---

## 🐳 Docker Setup

The project includes a **Next.js dashboard** (`app/`) for visualizing engagements and outcomes.

### Start with Docker Compose

```bash
# Build and start the container
docker-compose up --build

# Or start in background
docker-compose up -d --build
```

This will:
1. Build the `sensai-studio` image from the `app/` Dockerfile
2. Start the dashboard on **http://localhost:3000**
3. Mount the harness root read-only so the dashboard can access engagements and outcomes
4. Automatically restart the container unless stopped

### Access the Dashboard

Once running, visit: **http://localhost:3000**

The dashboard provides:
- 📋 Engagement registry and status
- 🔍 Search across theories and models
- 📊 Visual pipeline progress
- 📂 File browser for outcomes

### Docker Troubleshooting

```bash
# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Clean up
docker-compose down -v
```

---

## 🔄 The Pipeline

Sensai Mission Control is a **13-phase pipeline** that turns research into answers:

```
INPUT PHASE              ANALYSIS PHASE           EVALUATION PHASE
────────────             ──────────────           ────────────────
Question ──────────────> Extract ────────────────> Consume
   ↓                        ↓
 (Calibrate research    (Parse sources          (Build knowledge
  direction)            into text)              nodes)
                           ↓
                          Index
                           ↓
                        (Map corpus)

                                              ↓
                                          Analyze
                                           (Find
                                         theories)
                                             ↓
                                        Resolve-Conflict
                                        (Human-in-loop)

OUTPUT PHASE
────────────
Evaluate ────> Stress-Test ────> Verify ────> Synthesize ────> Broadcast
   ↓               ↓               ↓               ↓              ↓
(Econ           (Self-audit)     (Hard         (Strategic       (Public
 models)                        verdict)      alignment doc)     copy)

MONITORING (run on rhythm)
─────────────────────────
Longitudinal ────> Daily-Summary ────> Audit
(Conversion funnel, question coverage, drift trends)
```

---

## 📁 Project Structure

```
sensai-finder/
├── README.md                  ← you are here
├── EXAMPLE.md                 ← complete end-to-end walkthrough
├── CLAUDE.md                  ← full architectural guide
├── HOW_TO.md                  ← operator manual (what to type)
├── AGENTS.md                  ← command quick-reference
│
├── docker-compose.yml         ← dashboard container config
├── .claude/                   ← Claude Code system logic
│   ├── agents/               # 10 pipeline subagents
│   ├── skills/               # 17 slash commands (/question, /analyze, etc.)
│   ├── scripts/              # Hook implementations
│   └── settings.json         # Harness configuration
│
├── app/                       ← Next.js dashboard (separate from pipeline)
│   ├── Dockerfile
│   ├── package.json
│   └── src/                  # Dashboard UI components
│
├── operations/                ← system wiki and templates
│   ├── INDEX.md              # Global engagement registry
│   ├── README.md             # Architecture and leverage rules
│   ├── templates/            # Schema templates for artifacts
│   └── guides/               # Editing, maintenance, output quality
│
├── engagements/               ← isolated tenant workspaces (git-ignored)
│   └── README.md             # Why engagements aren't tracked here
│
├── agents/                    ← design inputs and archive
│   └── archive/              # Historical versions, design decisions
│
└── tests/                     ← bats regression tests for hooks
```

**Key insight:** This is **two git repos, two trust boundaries**:
- **Harness repo** (this repo): System logic, global config, tests
- **Engagement repos**: Each engagement under `engagements/<name>/` has its own standalone git repo with separate history

---

## 🚀 First Research Run

### Step 1: Initialize Your Engagement

```bash
# Inside claude:
/bootstrap

# Then create a new engagement:
/init-engagement my-research
```

### Step 2: Add Your Research

Drop your sources into:
```
engagements/my-research/research_body/00_inbox/
```

Supported formats: PDFs, markdown, plain text, transcripts.

### Step 3: Define Your Goal

Run the question phase to calibrate your research direction:

```
/question "How can we optimize discovery velocity while maintaining rigor?"
```

Claude will produce a `research_questions.md` with falsifiable questions to guide analysis.

### Step 4: Extract, Consume, Analyze

```
# Extract text from PDFs
/extract all

# Build knowledge nodes from sources
/consume all

# Build corpus map
/index

# Synthesize theories against research questions
/analyze
```

### Step 5: Evaluate & Verify

```
# Convert theories to economic models
/evaluate node--theory-slug

# Self-audit: is this grounded in the corpus?
/stress-test outcomes/01_theories/node--theory-slug.md

# Synthesize into strategic alignment document
/synthesize
```

### Step 6: Produce Deliverables

```
# Turn alignment doc into public-facing copy
/broadcast outcomes/04_alignment/alignment--final.md
```

---

## 📖 Learn More

- **[EXAMPLE.md](EXAMPLE.md)** — Complete end-to-end walkthrough with examples
- **[CLAUDE.md](CLAUDE.md)** — Full architectural guide for Claude Code
- **[HOW_TO.md](HOW_TO.md)** — Operator manual: what to type, what happens
- **[AGENTS.md](AGENTS.md)** — Command quick-reference for all `/` commands
- **[operations/README.md](operations/README.md)** — I/O contract, leverage rules, pipeline diagram

---

## 🎯 Core Concepts

### Engagements
Isolated research workspaces. Each engagement has its own goals, sources, and outcomes. Switch between them with `/switch <name>`.

### Work Blocks
One skill invocation = one Work Block. Automatically logged and committed to the engagement's git repo with a unique ID.

### Gated Artifacts
Every deliverable (theory, model, alignment doc) passes through a schema gate. Invalid artifacts are quarantined, not silently rejected.

### Human-in-Loop Points
The pipeline stops and waits for you at:
- **Quarantined conflicts** in `research_body/04_quarantine/` — contradictions the analyst can't resolve
- **FAIL verdicts** from `/stress-test` — claims not grounded in the corpus

### Wiki Discipline
Every artifact is a small, typed markdown page with `[[wikilinks]]`. Index pages (INDEX.md) are your navigation — skim them instead of re-reading full directories.

---

## ⚙️ Technology Stack

- **Claude Code** — Orchestration engine (slash commands, agents, hooks)
- **Claude API** — Agents use Fable (research), Opus (evaluation), Sonnet (analysis), Haiku (extraction)
- **Next.js** — Dashboard UI (optional, Docker-based)
- **Bun** — Package manager and JS runtime
- **Bash + Hooks** — Pipeline gates and logging

---

## 🔐 Two Git Repositories

**Important:** This project uses two separate git repos:

1. **Harness repo** (`.git/` at the root)
   - Contains: `.claude/`, `operations/`, `tests/`, `agents/`, `app/`
   - Requires explicit commit consent (like any dev repo)

2. **Engagement repos** (under `engagements/<name>/.git`)
   - Each is a standalone repository with separate history
   - Automatically committed once per Work Block
   - Git-ignored from the harness repo

Never mix these — don't expect `git log` in the harness to show engagement activity.

---

## 🆘 Troubleshooting

### Claude Code won't start
```bash
# Reinstall
brew uninstall claude
brew install anthropics/tap/claude

# Or update
claude update
```

### Docker build fails
```bash
# Clean up and rebuild
docker-compose down -v
docker-compose up --build
```

### Pipeline phase fails
Check the output — it will tell you why. Common issues:
- Missing `ANTHROPIC_API_KEY` environment variable
- Source file format not supported
- Artifact doesn't match schema (check `.rejected/` folder)

### Need help?
1. Check [EXAMPLE.md](EXAMPLE.md) for a real walkthrough
2. Read [operations/README.md](operations/README.md) for the I/O contract
3. See [CLAUDE.md](CLAUDE.md) for architecture details

---

## 📚 What This Replaces

Sensai Mission Control eliminates:
- ❌ Manually copy-pasting quotes between 10 open documents
- ❌ Theories that sound good but aren't grounded in sources
- ❌ Economic models with no clear path to monetization
- ❌ Strategic plans that assume facts not in evidence
- ❌ Hours of meeting overhead to align on research findings

---

## 🎓 For Researchers

- **Raw sources are fuel, not the deliverable** — the pipeline extracts the signal and discards noise
- **Theories must be falsifiable** — the system refuses vague or unsupported claims
- **Contradictions are visible, not hidden** — the quarantine queue shows gaps that need human judgment
- **Every claim is grounded** — stress-test verdicts trace back to original sources
- **Verification is built-in** — never deploy an unvetted model

---

## 🏗️ For Engineers

- **System is extensible** — add new pipeline phases following `operations/SKILL.md`
- **All logic is auditable** — hooks are shell scripts, agents are markdown, gates are templates
- **Work is logged mechanically** — `telemetry/execution.log` is the source of truth
- **Context bleed is impossible** — gate hooks enforce multi-tenancy per-write
- **No magic** — everything the pipeline does is either in CLAUDE.md or visible in `.claude/`

---

## 📞 Support & Contribution

- **Issues:** Report bugs or request features via GitHub Issues
- **Documentation:** See `operations/guides/` for detailed howtos
- **Extensions:** See `operations/SKILL.md` for adding new pipeline phases

---

**Ready to transform your research into answers?**

```bash
git clone https://github.com/sensai-org/sensai-finder.git
cd sensai-finder
claude
```

Then open [EXAMPLE.md](EXAMPLE.md) to see the full system in action.
