# Archived Markdown Workflow

Archived on 2026-09-02 when the application became the active practice logging interface.

This directory preserves the former file-based workflow:

- `logs/` contains the historical Markdown practice entries.
- `scripts/generate-practice-json.ts` reads the entries and generates `practice-days.json`.
- `.github/workflows/generate-practice-json.yml` is the former GitHub Actions workflow that generated the JSON and committed it as `github-actions[bot]`.

The automation is inactive because its workflow file is no longer located in the repository root's `.github/workflows/` directory.

To inspect or manually run the archived generator, work from this directory:

```bash
npm install
npm run generate
```
