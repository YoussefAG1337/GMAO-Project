# 🚀 AI Coding Workflow — Setup Progress

> **Machine:** Dell G15 5530 | i5-13450HX | 32GB RAM | RTX 3050 6GB | Windows 11 Pro
> **Last Updated:** 2026-06-10

---

## 📊 Overall Progress

```
Phase 1: Ollama (Local LLM)         ✅ DONE
Phase 2: Free Cloud API Keys        ✅ DONE
Phase 3: Claude Code Config         ✅ DONE
Phase 4: Hermes Agent               ⬜ PENDING
Phase 5: ChatGPT Custom GPTs        ⬜ PENDING
Phase 6: CrewAI (Python Agents)     ⬜ PENDING
```

---

## ✅ Phase 1 — Ollama (Local LLM Server)

**Status:** Complete ✅

- Ollama v0.30.7 installed
- Model downloaded: `qwen3:8b` (5.2 GB)
- API running at: `http://localhost:11434`
- Tested and responding correctly

### Ollama Quick Commands
```powershell
ollama list                  # See all models
ollama ps                    # See what's loaded in memory
ollama run qwen3:8b          # Chat directly
ollama pull <model>          # Download new model
ollama rm <model>            # Delete model
ollama stop <model>          # Unload from memory
```

### Models to Consider Adding
| Model | Size | Speed | Use Case |
|-------|------|-------|----------|
| `qwen3:8b` ✅ | 4.5GB | ~35 tok/s | Daily driver, fast |
| `qwen3:14b` | 8.5GB | ~14 tok/s | Smarter, complex tasks |
| `qwen3:30b` | 17GB | ~6 tok/s | Near cloud quality |
| `deepseek-r1:14b` | 9GB | ~12 tok/s | Deep reasoning |
| `phi4-mini` | 2.5GB | ~55 tok/s | Ultra-fast, light tasks |

---

## ✅ Phase 3 — Claude Code Configuration

**Status:** Complete ✅

- Config file: `C:\Users\DELL\.claude\settings.json`
- Connected to: OpenRouter (free models)
- Model: `nousresearch/hermes-3-llama-3.1-405b:free`
- All tools working (file access, terminal, code editing)

### Switching Models
```powershell
# Launch with specific model
claude --model nousresearch/hermes-3-llama-3.1-405b:free
claude --model meta-llama/llama-3.3-70b-instruct:free
claude --model qwen/qwen3-coder-480b-a35b:free

# Local model (chat only, no tools)
claude --model qwen3:8b
```

### Available Free OpenRouter Models
| Model | ID |
|-------|----|
| Hermes 3 405B | `nousresearch/hermes-3-llama-3.1-405b:free` |
| Llama 3.3 70B | `meta-llama/llama-3.3-70b-instruct:free` |
| Qwen3 Coder 480B | `qwen/qwen3-coder-480b-a35b:free` |
| Qwen3 Next 80B | `qwen/qwen3-next-80b-a3b-instruct:free` |
| Free Router (auto) | `openrouter/free` |

> ⚠️ Note: OpenRouter free models share rate limits globally — expect occasional "rate limit exceeded" errors. Retry after a few seconds.

---

## ✅ Phase 2 — Free Cloud API Keys

**Status:** Complete ✅

### Done
- [x] Get Gemini API key → https://aistudio.google.com → "Get API key"
- [x] Get Groq API key → https://console.groq.com → "API Keys"
- [x] Set environment variables (stored as User-level env vars)

### What You Get
| Provider | Free Limit | Model | Speed |
|----------|-----------|-------|-------|
| Gemini | 500 req/day (Flash) | Gemini 2.5 Flash | Fast |
| Gemini | 25 req/day (Pro) | Gemini 2.5 Pro | Medium |
| Groq | 30 req/min | Llama 3.3 70B | 🔥 Ultra-fast |

---

## ⬜ Phase 4 — Hermes Agent (Self-Learning Autonomous Agent)

**Status:** Pending

### Plan
- Install Hermes Desktop (native Windows GUI — no WSL2 needed)
- Download from: https://nousresearch.com
- Connect to local Ollama (qwen3:8b)
- CLI-only setup (no messaging gateways)

### What It Does
- Autonomous coding agent (like Claude Code but model-agnostic)
- Self-learning: extracts "Skills" from completed tasks
- Gets faster and smarter over time on YOUR projects
- Persistent memory across sessions (SQLite + FTS5)
- 40+ built-in tools (file ops, browser, code execution)
- MCP server support

---

## ⬜ Phase 5 — ChatGPT Custom GPTs

**Status:** Pending

### GPTs to Create
- [ ] 🎨 **UI/UX Architect** — Design critique, HTML/CSS generation, screenshots
- [ ] 🏗️ **System Architect** — System design, DB schema, API design
- [ ] 🔍 **Code Reviewer** — Security, bugs, performance, readability
- [ ] 🐛 **Bug Hunter** — Debugging, root cause analysis, prevention

> Using existing ChatGPT subscription (already paid)

---

## ⬜ Phase 6 — CrewAI (Python Agent Framework)

**Status:** Pending

### Plan
- Create Conda environment: `conda create -n ai-agents python=3.12`
- Install: `pip install crewai crewai-tools google-genai groq`
- Build agent team (Architect → Developer → Reviewer)
- Smart model router: Gemini → Groq → Ollama fallback

### Project Location
```
C:\Users\DELL\Desktop\ai-agents\
├── dev_team.py          # Main agent crew
├── model_router.py      # Smart free model rotation
└── agents/              # Individual agent configs
```

---

## 🛠️ Complete Tool Stack

```
┌──────────────────────────────────────────────────────┐
│              FULL AI DEVELOPMENT STACK                │
├──────────────────────────────────────────────────────┤
│                                                      │
│  💻 VS CODE                                          │
│  └── GitHub Copilot Pro (Student Pack)               │
│      └── GPT-4o, Claude, Gemini — Agent Mode         │
│                                                      │
│  🔧 TERMINAL AGENTS                                  │
│  ├── Claude Code → OpenRouter free models            │
│  ├── Gemini Code (this tool) → Gemini 2.5            │
│  └── Hermes Agent → Ollama local (PENDING)           │
│                                                      │
│  💬 CHAT & REASONING                                 │
│  ├── ChatGPT (paid sub) → o3, Vision, DALL-E, GPTs  │
│  ├── Ollama local → qwen3:8b (unlimited)             │
│  └── Claude.ai → free tier                           │
│                                                      │
│  🤖 ANTIGRAVITY SUBAGENTS (ACTIVE)                    │
│  ├── 🏗️ Backend Architect (Express/Prisma/API)        │
│  ├── 🎨 Frontend Developer (Next.js/React/UI)         │
│  ├── 🔍 Code Reviewer (Security/Bugs/Quality)         │
│  └── 🐛 Debugger (Root cause analysis/Fixes)          │
│                                                      │
│  🤖 CREWAI (PENDING — optional)                       │
│  └── CrewAI + Gemini/Groq/Ollama rotation            │
│                                                      │
│  🏠 LOCAL LLM                                        │
│  └── Ollama → qwen3:8b (always running)              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📋 Daily Workflow (Target)

```
Quick code completion     →  Copilot (inline)
Feature implementation    →  Copilot Agent Mode
Complex refactoring       →  Claude Code (OpenRouter)
Architecture planning     →  ChatGPT o3 / Architect GPT
UI review                 →  ChatGPT UI/UX GPT (screenshot)
Code review               →  ChatGPT Code Reviewer GPT
Debugging                 →  Claude Code / Bug Hunter GPT
Quick AI chat             →  ollama run qwen3:8b
Autonomous tasks          →  Hermes Agent
Batch processing          →  CrewAI Python agents
```
