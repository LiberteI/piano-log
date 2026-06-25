# Piano Practice Log

This repository tracks my piano practice consistency in Markdown and generates structured JSON that my portfolio website can consume. It is both a personal practice archive and a small automation project built around simple file-based data.

## Why This Exists

This is not an app. It is a lightweight pipeline for turning weekly piano practice logs into machine-readable data.

The logs live here in Markdown because they are easy to write, review, and keep in version control. A TypeScript script then converts that history into a JSON artifact that another project can read without parsing Markdown directly.

## Repository Structure

```text
piano-log/
├── logs/
├── scripts/
│   └── generate-practice-json.ts
├── generated/
│   └── practice-days.json
├── package.json
└── README.md
```

## Generated Data

The main generated artifact is:

```text
generated/practice-days.json
```

It provides a normalized daily practice map that another project can consume. My portfolio website can fetch this file and use it to render a practice contribution grid or a piano activity section.

Example:

```json
{
  "days": {
    "2026-01-01": true,
    "2026-01-02": false,
    "2026-01-03": true
  },
  "lastUpdated": "2026-06-24"
}
```

## How It Works

```text
weekly Markdown logs
        ↓
TypeScript generator script
        ↓
generated/practice-days.json
        ↓
portfolio website consumes JSON
```

## Usage

Install dependencies:

```bash
npm install
```

Generate the JSON artifact:

```bash
npm run generate
```

Running the generator reads the Markdown logs in `logs/` and overwrites `generated/practice-days.json` with the latest deterministic output.

## Design Principles

- Markdown logs are human-readable and easy to maintain.
- JSON output is machine-readable and easy for other projects to consume.
- GitHub is the source of truth for the practice history.
- The portfolio website is only a consumer of generated data.
- The project stays intentionally simple and avoids unnecessary complexity.

## Future Direction

Possible small extensions:

- streak calculation
- total practice days
- recent session summary
- GitHub Actions automation

The scope will stay focused on lightweight logging and data generation.
