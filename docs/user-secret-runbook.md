# MongoDB User Secrets Runbook

Use .NET User Secrets for the local MongoDB connection string. User Secrets are
stored outside this repository and must never be copied into Git-tracked files.

## One-Time Setup

Run these commands from the API project:

```bash
cd server/PianoLog.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:MongoDb" "<MongoDB connection string>"
```

Get the connection string from MongoDB Atlas or the team's password manager. Do
not paste it into this runbook, `appsettings.json`, the React client, or a
committed `.env` file.

## Verify

Check the configured values locally. This command prints secret values, so do
not run it in a recorded, shared, or pasted terminal session:

```bash
dotnet user-secrets list
```

Start the API:

```bash
dotnet run
```

The API reads the value using `ConnectionStrings:MongoDb` when it runs in the
Development environment.

## Rotate Or Remove

Replace the existing value by running the same `dotnet user-secrets set`
command with the new connection string. Remove it when it is no longer needed:

```bash
dotnet user-secrets remove "ConnectionStrings:MongoDb"
```

## Deployment

Set the production connection string in the hosting provider's secret manager
as `ConnectionStrings__MongoDb`. Environment variables override values from
`appsettings.json`.
