# Frontend Docs (version-2)

This folder holds the living documentation for **v2** of the Football Tournament Manager frontend:
implementation plans (temporary), feature docs, technical docs and future plans.
Read these before starting work. They are the source of context for anyone (human or AI) picking up the project.

| File | What it covers | Status |
|---|---|---|
| [01-tech-stack.md](./01-tech-stack.md) | Package versions, chosen libraries and the rules for using each one | Active |
| [02-generic-components.md](./02-generic-components.md) | Full list of shared UI components with their priority (P1/P2/P3) and intended API | Planning |
| [03-api-response-handling.md](./03-api-response-handling.md) | API response contract and the centralized frontend request wrapper | Planning |
| [04-coding-standards.md](./04-coding-standards.md) | Coding philosophy, layer responsibilities, naming, comments | Active |
| [05-project-structure.md](./05-project-structure.md) | Target folder layout and the changes from the current code | Active |
| [06-business-requirements.md](./06-business-requirements.md) | Core business pillars: users and roles, tournaments, teams, payments, live | Agreed |
| [plans/v1-to-v2-gap-analysis.md](./plans/v1-to-v2-gap-analysis.md) | What v1 does vs what v2 needs (keep / change / new / remove) | Draft |

Related backend docs live in `football-tournament-manager-backend/docs/`.

## Conventions for this folder
- One topic per file, prefixed with a number for reading order (`04-...md`).
- Feature docs: `features/<feature-name>.md`. Temporary implementation plans: `plans/<topic>.md`. Delete or archive a plan once it is done.
- Update the table above when adding a file.
- All v2 work is committed to the `version-2` branch.
