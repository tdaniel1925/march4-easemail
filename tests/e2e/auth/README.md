# E2E Auth Setup

Tests use cookie injection — you log in once in a browser and export the session.

## How to export your session cookie

1. Open Chrome and navigate to your running app (http://localhost:3000)
2. Log in normally with your Microsoft account
3. Open DevTools → Application → Cookies → http://localhost:3000
4. Find the cookie named `sb-<project-ref>-auth-token` (or similar Supabase cookie)
5. Run the export script:

```bash
npm run test:e2e:export-session
```

OR manually create `tests/e2e/auth/session.json` with this shape:

```json
{
  "cookies": [
    {
      "name": "sb-cywnzbiacciujoxufqyp-auth-token",
      "value": "<paste cookie value here>",
      "domain": "localhost",
      "path": "/",
      "expires": -1,
      "httpOnly": true,
      "secure": false,
      "sameSite": "Lax"
    }
  ],
  "origins": []
}
```

## Cookie expires?

Supabase sessions last ~1 week by default. When tests start failing with redirect to /login,
re-export the cookie using the steps above.

## .gitignore

`tests/e2e/auth/session.json` is gitignored — never commit real session cookies.
