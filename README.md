# Piano Practice Log

This repository exists for two reasons: version control for my piano practice logs, and exporting a JSON file of practiced days for another project to consume.

## Why This Exists

This is not an app. It is a small file-based repository for storing piano logs in Git and generating one machine-readable artifact from them.

The Markdown files are the source of truth. The generator script reads those logs and exports practiced-day data as JSON so my portfolio does not need to parse Markdown directly.

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

The generated artifact is:

```text
generated/practice-days.json
```

It provides a daily practiced/not-practiced map that another project can consume. My portfolio website can fetch this file and use it to render a practice contribution grid or a piano activity section.

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

- Markdown logs are the source of truth.
- Git provides version control for the practice history.
- JSON export is only for practiced-day data.
- The portfolio website is only a consumer.
- The repository stays intentionally simple.

## Scope

The scope of this repository is intentionally narrow:

- store piano logs in version control
- export practiced-day JSON
