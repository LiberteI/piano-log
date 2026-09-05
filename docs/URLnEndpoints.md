# URLs and Endpoints

## Deployments

| Service | URL |
| --- | --- |
| Frontend | `https://piano-log-eight.vercel.app` |
| API | `https://piano-logger-hfhfe8dxbhf5cgh2.canadacentral-01.azurewebsites.net` |
| API health check | `https://piano-logger-hfhfe8dxbhf5cgh2.canadacentral-01.azurewebsites.net/api/health` |

## Frontend Routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/login` | Google sign-in | Public |
| `/` | Create or edit a practice log | Authenticated |
| `/history` | Practice archive | Authenticated |
| `/history/:practiceDate` | Read-only practice report | Authenticated |

## API Endpoints

All endpoints except health and Google sign-in require this request header:

```http
Authorization: Bearer <piano-log-access-token>
```

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Confirms the API is running | No |
| `POST` | `/api/auth/google` | Exchanges a verified Google ID token for a Piano Log access token | No |
| `GET` | `/api/logs` | Lists logs newest first | Yes |
| `GET` | `/api/logs/{practiceDate}` | Gets one log by `YYYY-MM-DD` | Yes |
| `POST` | `/api/logs` | Creates a log | Yes |
| `PUT` | `/api/logs/{originalPracticeDate}` | Updates a log | Yes |
| `DELETE` | `/api/logs/{practiceDate}` | Deletes a log | Yes |
| `GET` | `/api/exports/practice-days` | Downloads `practice-days.json` | Yes |

## Request Examples

Create a log:

```json
{
  "practiceDate": "2026-09-05",
  "practiceTime": {
    "hours": 1,
    "minutes": 30
  },
  "fundamentals": [],
  "pieces": [],
  "reflection": null
}
```

Exchange a Google credential:

```json
{
  "credential": "GOOGLE_ID_TOKEN"
}
```

The login endpoint returns an `accessToken` and `expiresAtUtc`. A direct browser visit to `/api/auth/google` returns `405 Method Not Allowed` because it accepts `POST` only.

## Expected Status Codes

| Status | Meaning |
| --- | --- |
| `200` | Request succeeded |
| `201` | Practice log created |
| `204` | Practice log deleted |
| `400` | Invalid request data |
| `401` | Missing, expired, or invalid access token |
| `403` | Google account is not the allowed account |
| `404` | Log or route does not exist |
| `409` | A log already exists for that practice date |
