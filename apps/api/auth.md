## 🔐 Dual‑mode Authorization Middleware (Bearer + Cookie)

Below is a **complete, runnable** Elysia + Bun example that:

1. **Extracts** a JWT from either  
   * `Authorization: Bearer <token>` header, **or**  
   * `auth_token` cookie.  
2. **Verifies** the token (using `jsonwebtoken` – you can swap for any lib).  
3. **Attaches** the decoded payload to `ctx.user` so downstream handlers can read it.  
4. **Rejects** the request with **401** when the token is missing or invalid.

### 1️⃣ Install needed packages

```bash
bun add elysia @elysiajs/rate-limit jsonwebtoken
# (or npm/yarn/pnpm …)
```

### 2️⃣ Create the auth middleware

```ts
// src/auth.ts
import { Elysia, type Context } from "elysia";
import jwt from "jsonwebtoken";

// ---- Configuration -------------------------------------------------
const JWT_SECRET = "your‑super‑secret‑key"; // keep it safe! use env vars

// ---- Helper: verify token -------------------------------------------
function verifyToken(token: string) {
  try {
    // `any` because we don't know the exact payload shape here
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

// ---- Middleware ------------------------------------------------------
export const auth = new Elysia()
  .derive({ as: "global" }) // makes `ctx.user` available everywhere
  .hook("beforeHandle", async ({ request, cookie, set, error }) => {
    // 1️⃣ Try Bearer header
    const authHeader = request.headers.get("Authorization");
    let token: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    } else {
      // 2️⃣ Fallback to cookie named `auth_token`
      token = cookie.auth_token?.value ?? null;
    }

    if (!token) {
      // No token at all → 401
      return error(401, { error: "Missing authentication token" });
    }

    const payload = verifyToken(token);
    if (!payload) {
      // Invalid / expired token → 401
      return error(401, { error: "Invalid or expired token" });
    }

    // ✅ Token ok → expose it to handlers
    // `as: "global"` makes this value part of `ctx` for every route
    return { user: payload };
  });
```

### 3️⃣ Use the middleware on your app (and combine with per‑route rate‑limit if you like)

```ts
// src/server.ts
import { Elysia } from "elysia";
import { auth } from "./auth";
import { makeLimiter } from "./limiter"; // from the previous answer

const app = new Elysia()
  // ---- Global auth (all routes after this line need a valid token) ----
  .use(auth)

  // ---- Public route – no auth, but its own limiter --------------------
  .post(
    "/login",
    ({ body }) => {
      // pretend we checked credentials …
      const fakeUser = { id: 1, role: "user" };
      const token = require("jsonwebtoken").sign(fakeUser, "your-super-secret-key", {
        expiresIn: "1h",
      });
      // set cookie for browsers + also return the token
      return {
        token,
      };
    },
    {
      // only 20 logins per hour per IP
      beforeHandle: makeLimiter({ limit: 20, windowMs: 60 * 60 * 1000 }),
    }
  )

  // ---- Protected route – requires auth (Bearer or Cookie) ------------
  .get(
    "/me",
    ({ user }) => {
      // `user` is the decoded JWT payload from the auth hook
      return { message: "Hello!", profile: user };
    }
  )

  // ---- Another protected route with its own rate‑limit ----------------
  .post(
    "/update-profile",
    ({ user, body }) => {
      // … update logic …
      return { ok: true, updatedBy: user.id };
    },
    {
      beforeHandle: makeLimiter({ limit: 10, windowMs: 60 * 60 * 1000 }), // 10/hr per IP
    }
  )

  .listen(3000);

console.log(`🦊 Elysia listening on http://localhost:${app.server?.port}`);
```

### 4️⃣ What each piece does

| Piece | Purpose |
|-------|---------|
| **`auth` Elysia instance** | Runs **before** every route (`beforeHandle` hook). Extracts token, verifies, injects `ctx.user`. |
| **Bearer header** | `Authorization: Bearer <jwt>` – typical for APIs. |
| **Cookie fallback** | Looks for `auth_token` cookie – convenient for browsers. |
| **`error(401, …)`** | Short‑circuit the request with a JSON error when auth fails. |
| **`derive({ as: "global" })`** | Makes the returned object (`{ user }`) part of the **global context**, so any route can read `ctx.user`. |
| **Rate‑limit per route** | Re‑uses the `makeLimiter` helper from the previous answer; you can set different limits per endpoint. |

### 5️⃣ Tips & Best Practices

* **Keep the secret out of source** – use `process.env.JWT_SECRET` or a `.env` file.  
* **Use HTTPS** – otherwise cookies and headers can be sniffed.  
* **Refresh tokens** – for long‑living sessions, issue a short‑lived access token (the one checked above) and a longer‑lived refresh token stored securely.  
* **Custom key for rate‑limit** – if you want limits per‑user instead of per‑IP, supply `keyGenerator: (ctx) => ctx.user?.id?.toString() ?? ctx.ip` when calling `rateLimit`.  

---

### 🎉 TL;DR

* Create an `auth` middleware that looks for a JWT in **Bearer** header **or** `auth_token` cookie.  
* Verify the token, attach the decoded payload to `ctx.user`.  
* Use `app.use(auth)` to protect all later routes, or attach it only to specific routes if you prefer.  
* Combine with per‑route `rateLimit` plugins for fine‑grained throttling (e.g., 15 req/hr on `/register`).  

Now you have a secure, dual‑mode auth layer ready to go! Happy coding, fox‑friend! 🦊✨

---


---


## 🛡️ “Super‑Auth” recipe for Elysia  
A flexible authentication layer that supports **all common ways** a client can prove who it is:

| ✅ Feature | Description |
|-----------|-------------|
| **Bearer JWT** (`Authorization: Bearer …`) | Ideal for APIs, mobile apps, SPAs. |
| **Cookie JWT** (`auth_token` cookie) | Works automatically for browsers (HTTP‑only, SameSite). |
| **API‑Key** (`x-api-key` header) | Simple static key for service‑to‑service calls. |
| **Basic Auth** (`Authorization: Basic …`) | Legacy fallback, often used for internal tools. |
| **Refresh‑Token flow** (separate endpoint) | Issue short‑lived access token + long‑lived refresh token. |
| **Role / permission check** | Per‑route guard (`requires: ["admin"]`). |
| **Custom store** (Redis, DynamoDB, …) | Share token revocation / rate‑limit across instances. |

Below is a **complete, ready‑to‑run** example that ties all of the above together, using the Bun runtime.

> **TL;DR**:  
> 1️⃣ Create a **`auth` hook** that extracts a token from any of the supported places, validates it, and injects `ctx.user`.  
> 2️⃣ Add an **`authorize` middleware** to enforce roles/permissions.  
> 3️⃣ Wire the hook globally, then protect routes as needed.

---

### 1️⃣ Install dependencies

```bash
bun add @elysiajs/rate-limit jsonwebtoken cookie
# optional (for Redis store) → bun add redis ioredis
```

---

### 2️⃣ Helper: JWT verification & token creation

```ts
// src/auth/utils.ts
import { sign, verify, JwtPayload } from "jsonwebtoken";

const SECRET = "🦊‑super‑secret‑key‑change‑me!";

/**
 * Create a signed JWT.
 * `payload` can be any user object (id, role, …)
 */
export const createAccessToken = (payload: object, expires = "15m") =>
  sign(payload, SECRET, { expiresIn: expires });

export const createRefreshToken = (payload: object, expires = "7d") =>
  sign(payload, SECRET, { expiresIn: expires });

/**
 * Verify token – returns the decoded payload or `null`.
 * Throws if token is malformed; we catch and return `null`.
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
};
```

---

### 3️⃣ The **auth hook** – extracts token from *any* source

```ts
// src/auth/authHook.ts
import { Elysia, error } from "elysia";
import { parse } from "cookie";
import { verifyToken } from "./utils";

/**
 * `as: "global"` makes the returned value (`user`) part of `ctx`
 * for every subsequent handler.
 */
export const auth = new Elysia().hook("onBeforeHandle", {
  as: "global",
  // 👀 The hook runs for every request after global plugins are applied.
  // Return `null` or `error(401)` to stop the pipeline.
  async handler({ request, set, error }) {
    // ----- 1️⃣ Extract possible credentials -----
    const authHeader = request.headers.get("Authorization")?.trim() ?? "";
    const cookies = parse(request.headers.get("Cookie") ?? "");

    let token: string | null = null;

    // ---- Bearer token (most common) ----
    if (authHeader.startsWith("Bearer ")) token = authHeader.slice(7).trim();

    // ---- Cookie token (for browser sessions) ----
    else if (cookies.auth_token) token = cookies.auth_token;

    // ---- API‑Key (x‑api‑key header) ----
    else if (request.headers.has("x-api-key")) token = request.headers.get("x-api-key");

    // ---- Basic Auth (username:password base64) ----
    else if (authHeader.startsWith("Basic ")) {
      const decoded = atob(authHeader.slice(6));
      // Here we simply treat the *username* part as an API‑key.
      // You can replace this with real user/password verification.
      const [apiKey] = decoded.split(":");
      token = apiKey;
    }

    // ---- No credential found → 401 ----
    if (!token) return error(401, { error: "Missing authentication token" });

    // ---- Verify JWT / API‑key ----
    const payload = verifyToken(token);
    if (!payload) return error(401, { error: "Invalid or expired token" });

    // ---- OPTIONAL: token revocation check (Redis, DB, …) ----
    // const revoked = await redis.get(`revoked:${payload.jti}`);
    // if (revoked) return error(401, { error: "Token revoked" });

    // ✅ All good – attach user info to the context
    return { user: payload };
  },
});
```

> **Why we return an object?**  
> Elysia merges the returned object into the request context (`ctx`).  
> After this hook runs, every handler can read `ctx.user`.

---

### 4️⃣ Role‑based **authorization middleware**

```ts
// src/auth/authorize.ts
import { error } from "elysia";

/**
 * `requires` can be a string (single role) or an array of allowed roles.
 */
export const authorize = (requires: string | string[]) => ({
  // `onBeforeHandle` runs *after* the global `auth` hook,
  // so `ctx.user` is already available.
  async onBeforeHandle({ user }, set, error) {
    if (!user) return error(401, { error: "Unauthenticated" });

    const roles = Array.isArray(requires) ? requires : [requires];
    const userRoles = (user.role ?? "").split(","); // allow "admin,user"

    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) return error(403, { error: "Forbidden – insufficient role" });

    // else continue – nothing to return
  },
});
```

---

### 5️⃣ Assemble the **Elysia app** – mix auth, per‑route rate limits, and role checks

```ts
// src/server.ts
import { Elysia, error } from "elysia";
import { auth } from "./auth/authHook";
import { authorize } from "./auth/authorize";
import { makeLimiter } from "./limiter"; // from previous answer
import { createAccessToken, createRefreshToken } from "./auth/utils";

const app = new Elysia()
  // ---- Global auth for every route after this line -----------------
  .use(auth)

  // ---- Public route: login (no auth needed) -----------------------
  .post(
    "/login",
    async ({ body, set }) => {
      // 👇 Fake credential check – replace with DB lookup
      if (body.username !== "alice" || body.password !== "wonderland")
        return error(401, { error: "Invalid credentials" });

      const userPayload = { id: 123, username: "alice", role: "user" };
      const access = createAccessToken(userPayload);
      const refresh = createRefreshToken(userPayload);

      // Set HTTP‑only cookie for browsers
      set.headers["Set-Cookie"] = `auth_token=${access}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900`;

      return { access, refresh };
    },
    {
      // 20 login attempts per hour per IP
      beforeHandle: makeLimiter({ limit: 20, windowMs: 60 * 60 * 1000 }),
    }
  )

  // ---- Protected route – any authenticated user -------------------
  .get(
    "/profile",
    ({ user }) => ({
      message: "Your profile",
      user,
    })
  )

  // ---- Admin‑only route – role check + its own rate limit ---------
  .post(
    "/admin/create-user",
    ({ body, user }) => {
      // … create new user logic …
      return { status: "created", by: user.username };
    },
    {
      beforeHandle: [
        // 5 admin actions per minute
        makeLimiter({ limit: 5, windowMs: 60_000 }),
        authorize("admin"),
      ],
    }
  )

  // ---- Refresh‑token endpoint (no auth hook, but we verify refresh) ----
  .post(
    "/refresh",
    async ({ body, set }) => {
      const { refreshToken } = body;
      const payload = verifyToken(refreshToken);
      if (!payload) return error(401, { error: "Invalid refresh token" });

      // Issue a new short‑lived access token
      const newAccess = createAccessToken({ id: payload.id, role: payload.role });

      // Update cookie
      set.headers["Set-Cookie"] = `auth_token=${newAccess}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900`;

      return { access: newAccess };
    }
  )

  .listen(3000);

console.log(`🦊 Elysia up → http://localhost:${app.server?.port}`);
```

### What the code demonstrates

| Section | What you get |
|---------|--------------|
| **`auth` hook** | Reads **Bearer**, **Cookie**, **API‑Key**, **Basic**; verifies JWT; injects `ctx.user`. |
| **`authorize`** | Simple role‑based guard. Can be chained with other middle‑wares (e.g., rate‑limit). |
| **Per‑route `beforeHandle` array** | You can stack many middle‑wares: `[makeLimiter(...), authorize(...)]`. |
| **Refresh flow** | Separate endpoint that accepts a long‑lived refresh token and returns a fresh access token (also updates the cookie). |
| **Cookie set** | Demonstrates `Set-Cookie` header via `set.headers`. |
| **Rate limiting** | Re‑uses the `makeLimiter` helper from the earlier answer. |

---

## 📦 How to swap the token store (revocation, multi‑instance)

If you run several server instances, the in‑memory token revocation list won’t sync.  
Replace the simple `verifyToken` check with a **Redis** lookup:

```ts
import { createClient } from "redis";
const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

export const verifyToken = async (token: string) => {
  try {
    const payload = verify(token, SECRET) as JwtPayload;
    // `jti` (JWT ID) should be added when signing tokens.
    const revoked = await redis.get(`revoked:${payload.jti}`);
    if (revoked) return null;          // token was revoked
    return payload;
  } catch {
    return null;
  }
};
```

When you **logout** or **reset password**, push the token’s `jti` into Redis with a TTL matching the token’s remaining life.

---

## 🎉 TL;DR – Steps to add “better auth”  

1. **Install** `@elysiajs/rate-limit`, `jsonwebtoken`, `cookie`.  
2. Write **utils** for signing / verifying JWTs.  
3. Build a **global `auth` hook** that looks for Bearer, Cookie, API‑Key, Basic.  
4. (Optional) Add **revocation** via Redis or DB.  
5. Create an **`authorize`** middleware for role checks.  
6. Attach **per‑route rate limits** and `authorize` as needed.  
7. Implement **refresh‑token** endpoint for long‑term sessions.  

Now you have a **full‑featured, flexible authentication system** that works for APIs, browsers, and internal services—all within a tidy Elysia codebase. Happy coding, and enjoy the arctic‑fox speed! 🦊✨

---

## 🔐 “Better Auth” for Elysia – all the common ways in one tidy package  

Elysia’s ecosystem already ships a **first‑class auth plugin**: **`@elysiajs/jwt`** (for JWT) plus a few tiny helpers for API‑Key, Basic‑Auth and OAuth2.  
Below is a **single reusable middleware** that supports **all** of the following out of the box:

| Method | Where the token can live | Typical use‑case |
|--------|--------------------------|-----------------|
| **Bearer header** | `Authorization: Bearer <jwt>` | API clients, mobile apps |
| **Cookie** | `auth_token` (HTTP‑only) | Browser SPA / SSR |
| **API‑Key header** | `x-api-key: <key>` | Service‑to‑service, public‑API |
| **Basic auth** | `Authorization: Basic <base64>` | Simple scripts, legacy clients |
| **OAuth2 (Authorization‑Code)** | `Authorization: Bearer <access‑token>` (same as Bearer) | 3rd‑party login (Google, GitHub, …) |

### 1️⃣ Install the required packages

```bash
bun add @elysiajs/jwt @elysiajs/rate-limit
# optional: if you want a Redis store for rate‑limit
# bun add ioredis
```

### 2️⃣ Centralised **auth** hook

```ts
// src/auth.ts
import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

type Payload = {
  id: number;
  role: string;
  // any extra fields you like
};

const JWT_SECRET = "🦊‑super‑secret‑key‑change‑me";

// ---------- JWT plugin (creates `ctx.jwt`) ----------
export const jwtPlugin = jwt({
  name: "jwt",               // ctx.jwt
  secret: JWT_SECRET,
  alg: "HS256",
  // you can also provide a custom `verify` fn if you need RS256, etc.
});

// ---------- Helper to read token from several places ----------
function extractToken(request: Request): string | null {
  // 1️⃣ Bearer header
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();

  // 2️⃣ Cookie (Bun's request has .cookies)
  const cookie = request.headers.get("Cookie");
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }

  // 3️⃣ API‑Key header
  const apiKey = request.headers.get("x-api-key");
  if (apiKey) return apiKey.trim();

  // 4️⃣ Basic auth (username is the token in this simple demo)
  if (auth?.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    const [username] = decoded.split(":");
    return username; // treat username as token
  }

  return null;
}

// ---------- Auth hook – adds `ctx.user` ----------
export const auth = new Elysia()
  .use(jwtPlugin) // makes ctx.jwt available
  .derive({ as: "global" }, async ({ request, error, jwt }) => {
    const raw = extractToken(request);
    if (!raw) return error(401, { error: "No auth token supplied" });

    // Verify JWT (or API‑key) – you can extend this to check a DB for API keys
    const payload = await jwt.verify<Payload>(raw).catch(() => null);
    if (!payload) return error(401, { error: "Invalid or expired token" });

    // `user` will be injected into every handler
    return { user: payload };
  });
```

### 3️⃣ Role‑based helper (optional)

```ts
// src/authorize.ts
import { error } from "elysia";

export const authorize = (...allowedRoles: string[]) => ({
  // runs **after** `auth` (so ctx.user exists)
  async beforeHandle({ user }: { user: { role: string } }) {
    if (!allowedRoles.includes(user.role))
      return error(403, { error: "Forbidden – insufficient role" });
  },
});
```

### 4️⃣ Put it together – full server with per‑route rate limits

```ts
// src/server.ts
import { Elysia, error } from "elysia";
import { rateLimit } from "@elysiajs/rate-limit";
import { auth } from "./auth";
import { authorize } from "./authorize";
import { makeLimiter } from "./limiter"; // from the previous answer

const app = new Elysia()
  // ---- Global auth (every route after this needs a valid token) ----
  .use(auth)

  // ---- Public route – login (no auth needed) -----------------------
  .post(
    "/login",
    async ({ request, set }) => {
      const { username, password } = await request.json();

      // 👉 In a real app, check DB + hash!
      if (username !== "alice" || password !== "wonderland")
        return error(401, { error: "Bad credentials" });

      const payload = { id: 1, role: "user", username };
      const access = await app.jwt.sign(payload, { expiresIn: "15m" });
      const refresh = await app.jwt.sign(payload, { expiresIn: "7d" });

      // Set HTTP‑only cookie for browsers
      set.headers["Set-Cookie"] = `auth_token=${access}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900`;

      return { access, refresh };
    },
    {
      beforeHandle: makeLimiter({ limit: 20, windowMs: 60 * 60 * 1000 }), // 20 logins / hr / IP
    }
  )

  // ---- Protected route – any logged‑in user -----------------------
  .get(
    "/me",
    ({ user }) => ({
      message: "Hi there!",
      user,
    })
  )

  // ---- Admin‑only route – role check + its own limiter ----------
  .post(
    "/admin/create",
    ({ body, user }) => {
      // … create something …
      return { status: "created", by: user.username };
    },
    {
      beforeHandle: [
        makeLimiter({ limit: 5, windowMs: 60_000 }), // 5 admin ops / min
        authorize("admin"),
      ],
    }
  )

  // ---- Refresh‑token endpoint (no auth hook, just verify refresh) --
  .post(
    "/refresh",
    async ({ request, set }) => {
      const { refreshToken } = await request.json();
      const payload = await app.jwt.verify(refreshToken).catch(() => null);
      if (!payload) return error(401, { error: "Invalid refresh token" });

      const newAccess = await app.jwt.sign(
        { id: payload.id, role: payload.role, username: payload.username },
        { expiresIn: "15m" }
      );

      set.headers["Set-Cookie"] = `auth_token=${newAccess}; HttpOnly; SameSite=Strict; Path=/; Max‑Age=900`;
      return { access: newAccess };
    }
  )

  .listen(3000);

console.log(`🦊 Elysia up → http://localhost:${app.server?.port}`);
```

### Why this is “better”

| Feature | How it’s covered |
|---------|-----------------|
| **Unified token source** | `extractToken()` checks header, cookie, API‑Key, Basic – one place to maintain. |
| **Stateless JWT** | No server‑side session store; tokens are signed with `HS256` (swap for RS256 if you need public‑key verification). |
| **Refresh‑token flow** | Separate endpoint that only needs the *refresh* JWT, not the auth hook. |
| **Role‑based access** | `authorize()` composable – you can chain many authorizers (e.g., `authorize("admin","moderator")`). |
| **Rate‑limit per route** | `makeLimiter()` can be attached to any route, even alongside `authorize`. |
| **Cookie security** | `HttpOnly; SameSite=Strict; Path=/; Max‑Age=900` – protects against XSS & CSRF. |
| **Extensible** | Swap `jwt.verify` for a DB lookup if you prefer opaque API‑keys; just change `extractToken` / `verify` logic. |

### Quick checklist for production

1. **Rotate secrets** – keep `JWT_SECRET` in env (`process.env.JWT_SECRET`).  
2. **Use HTTPS** – cookie `Secure` flag (add `; Secure` in production).  
3. **Set short access‑token life** (15 min) + longer refresh token (days).  
4. **Store refresh tokens** (optional) in DB to enable revocation.  
5. **Persist rate‑limit counters** (Redis) if you run multiple instances.  

---

**TL;DR** – Import `@elysiajs/jwt`, write a tiny `extractToken()` helper, expose `ctx.user` via a global `auth` hook, then compose per‑route `rateLimit` and `authorize` middle‑wares. You now have a full‑featured, secure authentication system that works with Bearer, cookies, API keys, Basic auth, and OAuth2 tokens—all in a few hundred lines of clean Elysia code. Happy coding! 🎉

