# How this repo was built

This project doubles as a demonstration of a markdown-first workflow with an AI coding agent
(Claude Code).

The premise: the agent begins each session with a fresh context window, so the durable context
has to live in the repo as markdown — not in chat history. These files *are* that context:

- **`CLAUDE.md`** — the project constitution the agent reads every session: stack, conventions,
  and the hard rules it must not break.
- **`docs/PRD.md`** — what we're building, and (just as important) what we're deliberately not.
- **`docs/PLAN.md`** + **`docs/TASKS.md`** — the sequenced build the agent executes and checks off.
- **`docs/decisions/`** — the reasoning, captured so choices survive past the conversation that
  produced them.

The build proceeded milestone by milestone (see the git history), driven through the
[`agent-skills`](https://github.com/addyosmani/agent-skills) lifecycle —
`/spec → /plan → /build → /test → /review → /code-simplify → /ship` — with skills like
`test-driven-development`, `frontend-ui-engineering`, and `security-and-hardening` activating per
phase. The docs were written first, then the agent implemented against them test-first, updating
`TASKS.md` as it went. Decisions that surfaced mid-build were written up as ADRs rather than left
buried in a chat log.

The takeaway is simple: good documents are good context. The same files that make this repo
legible to a human reviewer are what made it legible to the agent that helped build it.
