# Import Archived Practice Logs

This one-time import reads every dated Markdown file in `archive/markdown-workflow/logs`. It imports total time, checked fundamental types, fundamental detail, Hanon/etude/repertoire entries, reflections, and the original Markdown for archival completeness.

Run it from the API directory after configuring `ConnectionStrings:MongoDb`:

```bash
dotnet run -- --import-archive
```

The command exits after importing. It skips records whose practice date already exists, so rerunning it is safe and will not overwrite logs created in the app.
