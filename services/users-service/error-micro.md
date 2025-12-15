Perfect 👍
If you’re doing **microservices**, then let’s lock in a **clean, minimal, but truly production-grade setup** — not over-engineered, but **future-proof**.

Below is what **real microservice teams** use with gRPC.

---

# ✅ Microservice-Grade gRPC Error Architecture

## 🎯 Design goals

* One error format across **all services**
* Machine-readable error codes
* No duplicate try/catch
* Works with API Gateway
* Works with retries & observability

---

# 🧱 Final Architecture

```
packages/
 ├─ common/
 │   ├─ grpc/
 │   │   ├─ errors.ts
 │   │   ├─ interceptor.ts
 │   │   └─ status.ts
 │   └─ proto/
services/
 ├─ user/
 │   ├─ service.ts
 │   ├─ repository.ts
 │   └─ domain-errors.ts
```

---

# 1️⃣ Global error codes (shared by all services)

### `packages/common/grpc/status.ts`

```ts
export const ERROR_CODE = {
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL: "INTERNAL_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODE[keyof typeof ERROR_CODE];
```

---

# 2️⃣ AppError (domain → transport safe)

### `packages/common/grpc/errors.ts`

```ts
import { status } from "@grpc/grpc-js";
import type { ErrorCode } from "./status";

export class AppError extends Error {
  constructor(
    public readonly grpcCode: status,
    public readonly errorCode: ErrorCode,
    message: string,
    public readonly details?: string
  ) {
    super(message);
  }
}
```

---

# 3️⃣ ONE global gRPC interceptor (VERY IMPORTANT)

### `packages/common/grpc/interceptor.ts`

```ts
import {
  Metadata,
  status,
  type ServiceError,
} from "@grpc/grpc-js";
import { AppError } from "./errors";

export function errorInterceptor(
  handler: any
) {
  return async (call: any, callback: any) => {
    try {
      await handler(call, callback);
    } catch (err) {
      callback(mapError(err), null);
    }
  };
}

function mapError(err: unknown): ServiceError {
  if (err instanceof AppError) {
    const md = new Metadata();
    md.set("error_code", err.errorCode);

    return {
      name: err.errorCode,
      code: err.grpcCode,
      message: err.message,
      details: err.details ?? err.message,
      metadata: md,
    };
  }

  return {
    name: "INTERNAL_ERROR",
    code: status.INTERNAL,
    message: "Internal server error",
    details: err instanceof Error ? err.message : "Unknown error",
    metadata: new Metadata(),
  };
}
```

✔ No try/catch in services
✔ Same behavior everywhere

---

# 4️⃣ Domain errors (User service only)

### `services/user/domain-errors.ts`

```ts
import { status } from "@grpc/grpc-js";
import { AppError } from "@common/grpc/errors";
import { ERROR_CODE } from "@common/grpc/status";

export const UserError = {
  notFound: (id: string) =>
    new AppError(
      status.NOT_FOUND,
      ERROR_CODE.NOT_FOUND,
      "User not found",
      `User with id ${id} does not exist`
    ),

  alreadyExists: (email: string) =>
    new AppError(
      status.ALREADY_EXISTS,
      ERROR_CODE.ALREADY_EXISTS,
      "User already exists",
      `User with email ${email} already exists`
    ),

  invalid: (msg: string) =>
    new AppError(
      status.INVALID_ARGUMENT,
      ERROR_CODE.VALIDATION,
      msg
    ),
};
```

---

# 5️⃣ Service becomes VERY small & clean

### `services/user/service.ts`

```ts
import { errorInterceptor } from "@common/grpc/interceptor";
import { UserError } from "./domain-errors";

export const UsersService = {
  getUser: errorInterceptor(async (call, callback) => {
    const { id } = call.request;

    if (!id) throw UserError.invalid("User ID is required");

    const user = await UserRepository.getUserById(id);
    if (!user) throw UserError.notFound(id);

    callback(null, user);
  }),

  createUser: errorInterceptor(async (call, callback) => {
    const { email } = call.request;

    if (await UserRepository.getUserByEmail(email)) {
      throw UserError.alreadyExists(email);
    }

    const user = await UserRepository.createUser(call.request);
    callback(null, user);
  }),
};
```

👉 **No boilerplate**
👉 **No error mapping inside service**
👉 **Readable**

---

# 6️⃣ API Gateway / Client handling (🔥 huge win)

```ts
catch (err) {
  const code = err.metadata?.get("error_code")?.[0];

  if (code === "NOT_FOUND") {
    return res.status(404).json({ message: "User not found" });
  }
}
```

---

# 7️⃣ Observability (microservice MUST-have)

Inside interceptor:

```ts
console.error({
  service: "user",
  errorCode: err.errorCode,
  message: err.message,
});
```

Later → OpenTelemetry / Prometheus.

---

# 🧠 Why this is the BEST for microservices

| Feature                | Status |
| ---------------------- | ------ |
| Single error contract  | ✅      |
| Shared across services | ✅      |
| API Gateway friendly   | ✅      |
| Retry-safe             | ✅      |
| Observable             | ✅      |
| Scales to 50+ services | ✅      |

---

# 🔥 Final Recommendation

✔ Use **Interceptor-based errors**
✔ Use **machine error codes**
✔ Keep services **thin**
✔ Keep domain logic in repositories / services

---

If you want next:

* 🔐 Auth interceptor (JWT / internal token)
* 🧬 Correlation ID / request ID
* 📊 Metrics per gRPC method
* 🔁 Retry & idempotency strategy

Just tell me which one 🚀
`