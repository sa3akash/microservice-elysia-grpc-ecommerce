## ✨ Quick “Rate‑Limiter” recipe for Elysia

Elysia doesn’t have a built‑in limiter, but the official plugin **@elysiajs/rate-limit** makes it a breeze.  
Below is a minimal, working example using the Bun runtime.

```ts
// src/server.ts
import { Elysia } from "elysia";
import { rateLimit } from "@elysiajs/rate-limit";

// ── Create the app ─────────────────────────────────────────────
const app = new Elysia()
  // ── Attach the limiter ───────────────────────────────────────
  .use(
    rateLimit({
      // max 5 requests per 10 seconds per IP
      limit: 5,
      window: 10_000, // ms
      // optional: custom response when limit is hit
      error: (ctx) => ({
        status: 429,
        body: { error: "Too many requests – try again later" },
      }),
    })
  )
  // ── Your normal routes ───────────────────────────────────────
  .get("/", () => "👋 hello")
  .post("/data", ({ body }) => body)
  .listen(3000);

console.log(`🦊 Elysia listening at http://localhost:${app.server?.port}`);
```

### How it works

| Piece | What it does |
|-------|--------------|
| **rateLimit(options)** | Returns a *plugin* that registers a middleware. The middleware checks a tiny in‑memory store (or a custom store you provide) and decides whether to allow the request. |
| `limit` | Maximum number of requests allowed in the window. |
| `window` | Time‑frame in **milliseconds**. |
| `error` | Optional function to shape the “429 Too Many Requests” response. |
| `keyGenerator` (optional) | Function to decide the *key* for counting (default: IP address). You can use user‑id, API‑key, etc. |
| `store` (optional) | Replace the default in‑memory map with Redis, Mongo, etc., for distributed rate‑limiting. |

### Adding a custom key (e.g., API key)

```ts
.use(
  rateLimit({
    limit: 100,
    window: 60_000,
    keyGenerator: (ctx) => ctx.request.headers.get("x-api-key") ?? ctx.ip,
  })
)
```

### Using a Redis store (for many instances)

```ts
import { redisStore } from "@elysiajs/rate-limit/redis";
import { createClient } from "redis";

const client = createClient({ url: "redis://localhost:6379" });
await client.connect();

app.use(
  rateLimit({
    limit: 200,
    window: 60_000,
    store: redisStore({ client }),
  })
);
```

### Summary

* Install the plugin: `bun add @elysiajs/rate-limit` (or npm/yarn).  
* Call `.use(rateLimit({ … }))` before your routes.  
* Configure `limit`, `window`, and optional hooks (`error`, `keyGenerator`, `store`).  

That’s it—your Elysia server now protects endpoints from abuse! 🎉

*Feel free to tweak the numbers or plug in a Redis store for production‑grade scaling.*
- [Path priority - essential/route](https://elysiajs.com/essential/route#path-priority)
- [Request - essential/handler](https://elysiajs.com/essential/handler#request)
- [Lifecycle - essential/life-cycle](https://elysiajs.com/essential/life-cycle#lifecycle)
- [Best Practice - essential/best-practice](https://elysiajs.com/essential/best-practice#best-practice)
- [Validation - essential/validation](https://elysiajs.com/essential/validation#validation)
- [Server Sent Events (SSE) - essential/handler](https://elysiajs.com/essential/handler#server-sent-events-sse)
- [Plugin - essential/plugin](https://elysiajs.com/essential/plugin#plugin)
- [Lazy Load - essential/plugin](https://elysiajs.com/essential/plugin#lazy-load)
- [Controller - essential/best-practice](https://elysiajs.com/essential/best-practice#controller)
- [Handle - essential/route](https://elysiajs.com/essential/route#handle)
- [Reuse a plugin - essential/best-practice](https://elysiajs.com/essential/best-practice#reuse-a-plugin)
- [Plugin Deduplication - essential/plugin](https://elysiajs.com/essential/plugin#plugin-deduplication)
- [Path type - essential/route](https://elysiajs.com/essential/route#path-type)
- [Stream - essential/handler](https://elysiajs.com/essential/handler#stream)
- [Config - essential/plugin](https://elysiajs.com/essential/plugin#config)



---


## 🎯 Per‑route rate limiting in Elysia  
You can give each endpoint its **own** limit (e.g., `/register` → 15 req / hour, `/login` → 20 req / hour).  
Do it by **calling `rateLimit()` inside the route definition** instead of registering it globally.

### 1️⃣ Install the plugin  

```bash
bun add @elysiajs/rate-limit
# or npm/yarn/pnpm …
```

### 2️⃣ Create a tiny helper that returns a limiter middleware  

```ts
// src/limiter.ts
import { rateLimit } from "@elysiajs/rate-limit";

export const makeLimiter = ({
  limit,
  windowMs,
}: { limit: number; windowMs: number }) =>
  rateLimit({
    limit,
    window: windowMs,
    // optional: nice 429 JSON payload
    error: () => ({
      status: 429,
      body: { error: "Too many requests – please wait." },
    }),
  });
```

### 3️⃣ Apply it per route  

```ts
// src/server.ts
import { Elysia } from "elysia";
import { makeLimiter } from "./limiter";

const app = new Elysia()
  // ── Register route – 15 calls per hour ───────────────────────
  .post(
    "/register",
    ({ body }) => {
      // … registration logic …
      return { ok: true };
    },
    {
      // the third argument is the “options” object for the route
      // `beforeHandle` runs before the handler; we plug the limiter here
      beforeHandle: makeLimiter({ limit: 15, windowMs: 60 * 60 * 1000 }),
    }
  )
  // ── Login route – 20 calls per hour ───────────────────────────
  .post(
    "/login",
    ({ body }) => {
      // … login logic …
      return { token: "…" };
    },
    {
      beforeHandle: makeLimiter({ limit: 20, windowMs: 60 * 60 * 1000 }),
    }
  )
  // ── Any other route can have its own limiter or none ────────
  .get("/", () => "👋 welcome")
  .listen(3000);

console.log(`🦊 Elysia running on http://localhost:${app.server?.port}`);
```

### How it works  

| Step | What happens |
|------|--------------|
| `makeLimiter({limit, windowMs})` | Returns a **middleware** (a plugin) that keeps a counter for the request’s key (default = IP). |
| `beforeHandle` in the route options | Tells Elysia to run that middleware **before** the route handler. If the counter is over the limit, the middleware sends a 429 response and **skips** the handler. |
| Different calls → different middleware instances | Each route gets its own counter configuration, so limits are independent. |

### Customising the key (e.g., per‑user, per‑API‑key)

If you want to limit *per user* rather than per IP:

```ts
export const makeLimiter = ({
  limit,
  windowMs,
  keyGen,
}: {
  limit: number;
  windowMs: number;
  keyGen?: (ctx: any) => string;
}) =>
  rateLimit({
    limit,
    window: windowMs,
    keyGenerator: keyGen,
  });
```

Usage:

```ts
.post(
  "/login",
  handler,
  {
    beforeHandle: makeLimiter({
      limit: 20,
      windowMs: 60 * 60 * 1000,
      // use the API‑key header as the unique key
      keyGen: (ctx) => ctx.request.headers.get("x-api-key") ?? ctx.ip,
    }),
  }
)
```

### Storing counters in Redis (multi‑instance apps)

```ts
import { redisStore } from "@elysiajs/rate-limit/redis";
import { createClient } from "redis";

const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

export const makeLimiter = ({ limit, windowMs }: { limit: number; windowMs: number }) =>
  rateLimit({
    limit,
    window: windowMs,
    store: redisStore(redis),   // ← shared store across servers
  });
```

Now every server instance reads/writes the same counters, so the 15‑per‑hour limit works globally.

---

### 📋 TL;DR

1. **Install** `@elysiajs/rate-limit`.  
2. Write a small `makeLimiter({limit, windowMs, …})` helper that returns `rateLimit(...)`.  
3. Attach it to a route with the `beforeHandle` option.  
4. (Optional) customise the key or swap the store to Redis for distributed limits.

Happy limiting! 🎉

