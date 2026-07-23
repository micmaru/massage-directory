# FEATURE-BRANCH GIT WORKFLOW (mmstart / mmdone)

Status: locked

Source: Session Log — 13 July 2026 (session workflow change)

Feature-branch workflow replaces direct-to-main work.

Two zsh functions in `~/.zshrc`:
- `mmstart <name>` — checks out main, pulls, creates and switches to `feature/YYYY-MM-DD-<name>`
- `mmdone` — merges the current feature branch into main, pushes, deletes the feature branch

Locked pattern: `mmstart` at the beginning of each piece of work → confirm the branch name matches in BOTH the zsh and Claude Code terminals (`git branch --show-current` in each) before briefing → the same check in reverse (both terminals show `main`) after `mmdone`.
