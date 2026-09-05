# Authentication

Piano Log uses Google Identity Services for sign-in and a short-lived Piano Log JWT for API authorization.

## Flow

1. The browser loads Google's official sign-in button with `VITE_GOOGLE_CLIENT_ID`.
2. Google returns an ID token to the Login page.
3. The browser sends the ID token to `POST /api/auth/google`.
4. The API verifies the token's signature, issuer, audience, and expiration.
5. The API allows only `Google:AllowedEmail`, then returns an eight-hour Piano Log access token.
6. The frontend stores that access token in `sessionStorage` and sends it as a bearer token for protected API requests.

Closing the browser session clears the stored token and requires signing in again.

## Google Cloud Setup

Create an OAuth 2.0 Client ID with application type **Web application**. Add these exact Authorized JavaScript origins:

```text
http://localhost:5173
https://piano-log-eight.vercel.app
```

Add `http://127.0.0.1:5173` only if you use that address locally. Do not add trailing slashes. This JavaScript callback flow does not need an Authorized redirect URI.

The Google Client ID is public configuration. The Google Client Secret is not used by this application and must not be added to Vercel, frontend files, or source control.

## Local Configuration

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:5221
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

Set backend values with .NET user secrets:

```bash
cd server/PianoLog.Api

dotnet user-secrets set "ConnectionStrings:MongoDb" "YOUR_MONGODB_CONNECTION_STRING"
dotnet user-secrets set "ClientOrigin" "http://localhost:5173"
dotnet user-secrets set "Google:ClientId" "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
dotnet user-secrets set "Google:AllowedEmail" "YOUR_GOOGLE_ACCOUNT_EMAIL"
dotnet user-secrets set "Jwt:SigningKey" "YOUR_GENERATED_SIGNING_KEY"
```

Generate the signing key once:

```bash
openssl rand -base64 48
```

Run the API and frontend in separate terminals:

```bash
cd server/PianoLog.Api
dotnet run
```

```bash
cd client
npm run dev
```

Restart Vite after changing `.env.local`.

## Production Configuration

In Vercel, set these Production environment variables and redeploy:

```text
VITE_API_URL=https://piano-logger-hfhfe8dxbhf5cgh2.canadacentral-01.azurewebsites.net
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

In Azure App Service, set:

```text
ConnectionStrings__MongoDb=YOUR_MONGODB_CONNECTION_STRING
ClientOrigin=https://piano-log-eight.vercel.app
Google__ClientId=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
Google__AllowedEmail=YOUR_GOOGLE_ACCOUNT_EMAIL
Jwt__SigningKey=YOUR_GENERATED_SIGNING_KEY
```

The API also accepts `GOOGLE_CLIENT_ID`, `GOOGLE_ALLOWED_EMAIL`, and `JWT_SIGNING_KEY` for the last three backend values. Do not prefix backend secrets with `VITE_`.

## Security Rules

- `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` are public browser configuration.
- `ConnectionStrings__MongoDb` and `Jwt__SigningKey` are secrets.
- Never expose MongoDB credentials, JWT signing keys, or the Google Client Secret to the browser.
- All log and export endpoints require `Authorization: Bearer <access-token>`.
- `/api/health` and `POST /api/auth/google` are intentionally public.
