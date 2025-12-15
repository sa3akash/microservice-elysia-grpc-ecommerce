Yes — there **is a much better, cleaner, and safer way** to handle errors in a gRPC server 👍
Right now your code works, but it has **too much duplication**, **inconsistent messages**, and **unsafe casting**.

Below is the **production-grade pattern** used in real gRPC microservices.

---

# ❌ Problems in current error handling

1. **Repeated ServiceError creation** (copy–paste everywhere)
2. `as unknown as User` (unsafe, hides bugs)
3. Mixed responsibility:

   * validation
   * business logic
   * error formatting
4. Error messages are inconsistent
5. gRPC metadata is unused
6. No central error mapping

---

# ✅ BEST PRACTICE gRPC ERROR HANDLING

## 🎯 Goals

* One error format
* One error factory
* Typed domain errors
* Clean service methods
* Proper gRPC status codes
* Structured metadata

---

## 1️⃣ Create a gRPC error helper (ONE FILE)

### `grpc-error.ts`

```ts
import { status, Metadata, type ServiceError } from "@grpc/grpc-js";

export class GrpcError extends Error {
  constructor(
    public readonly code: status,
    message: string,
    public readonly details?: string,
    public readonly metadata?: Metadata
  ) {
    super(message);
  }

  toServiceError(): ServiceError {
    return {
      name: status[this.code],
      message: this.message,
      code: this.code,
      details: this.details ?? this.message,
      metadata: this.metadata ?? new Metadata(),
    };
  }
}
```

---

## 2️⃣ Domain error helpers (VERY important)

### `user.errors.ts`

```ts
import { status } from "@grpc/grpc-js";
import { GrpcError } from "@/grpc/grpc-error";

export const UserErrors = {
  notFound: (id: string) =>
    new GrpcError(
      status.NOT_FOUND,
      "User not found",
      `User with id ${id} does not exist`
    ),

  alreadyExists: (email: string) =>
    new GrpcError(
      status.ALREADY_EXISTS,
      "User already exists",
      `User with email ${email} already exists`
    ),

  invalidArgument: (message: string) =>
    new GrpcError(status.INVALID_ARGUMENT, message),

  internal: (err?: unknown) =>
    new GrpcError(
      status.INTERNAL,
      "Internal server error",
      err instanceof Error ? err.message : undefined
    ),
};
```

---

## 3️⃣ Map domain → gRPC (single catch block)

### `grpc-handler.ts`

```ts
import type { sendUnaryData } from "@grpc/grpc-js";
import { GrpcError } from "./grpc-error";
import { status, Metadata } from "@grpc/grpc-js";

export function handleGrpcError(
  error: unknown,
  callback: sendUnaryData<any>
) {
  if (error instanceof GrpcError) {
    return callback(error.toServiceError(), null);
  }

  // fallback
  callback(
    {
      name: "Internal",
      message: "Internal server error",
      code: status.INTERNAL,
      details: error instanceof Error ? error.message : "Unknown error",
      metadata: new Metadata(),
    },
    null
  );
}
```

---

## 4️⃣ Clean UserService (NO duplication)

### ✅ Example: `getUser`

```ts
import { handleGrpcError } from "@/grpc/grpc-handler";
import { UserErrors } from "@/errors/user.errors";

async getUser(call, callback) {
  try {
    const { id } = call.request;

    if (!id) {
      throw UserErrors.invalidArgument("User ID is required");
    }

    const user = await UserRepository.getUserById(id);
    if (!user) {
      throw UserErrors.notFound(id);
    }

    callback(null, user);
  } catch (error) {
    handleGrpcError(error, callback);
  }
}
```

---

### ✅ `createUser`

```ts
async createUser(call, callback) {
  try {
    const { name, email, password, phone } = call.request;

    if (!name || !email || !password || !phone) {
      throw UserErrors.invalidArgument("All fields are required");
    }

    if (await UserRepository.getUserByEmail(email)) {
      throw UserErrors.alreadyExists(email);
    }

    const user = await UserRepository.createUser({
      name,
      email,
      password,
      phone,
    });

    callback(null, user);
  } catch (error) {
    handleGrpcError(error, callback);
  }
}
```

---

### ✅ `getUsers` (proper response)

```ts
async getUsers(call, callback) {
  try {
    const users = await UserRepository.getUsers(
      call.request.limit ?? 10,
      call.request.offset ?? 0,
      call.request.role
    );

    callback(null, {
      users,
      total: users.length, // or COUNT query
    });
  } catch (error) {
    handleGrpcError(error, callback);
  }
}
```

---

## 5️⃣ Remove unsafe casting ❌

❌ BAD

```ts
user as unknown as User
```

✅ GOOD

```ts
callback(null, user);
```

If types don’t match → fix mapping, not casting.

---

## 6️⃣ Bonus: gRPC Metadata (advanced)

```ts
const metadata = new Metadata();
metadata.set("error_code", "USER_NOT_FOUND");

throw new GrpcError(
  status.NOT_FOUND,
  "User not found",
  undefined,
  metadata
);
```

Client can read:

```ts
error.metadata.get("error_code");
```

---

# ✅ Final Architecture

```
grpc/
 ├─ grpc-error.ts
 ├─ grpc-handler.ts
errors/
 ├─ user.errors.ts
services/
 ├─ users.service.ts
repository/
```

---

# 🧠 Why this is the BEST approach

| Feature                 | Status |
| ----------------------- | ------ |
| Single error format     | ✅      |
| Clean services          | ✅      |
| Typed domain errors     | ✅      |
| Correct gRPC codes      | ✅      |
| Easy to maintain        | ✅      |
| Scales to many services | ✅      |

---

If you want next:

* gRPC **interceptors** for error handling
* Auth interceptor (JWT / internal token)
* Logging + tracing (OpenTelemetry)
* API Gateway → gRPC error mapping

Just say 🔥



---


====================


Nice 😄
Let’s go **simpler first**, then **advanced but clean** — without over-engineering.

I’ll give you **2 levels**:

---

# ✅ LEVEL 1 — *Simplest & Clean (Recommended for most teams)*

👉 **ONE helper function**, no classes, no folders.

---

## 1️⃣ Minimal gRPC error helper (single file)

### `grpcError.ts`

```ts
import { status, Metadata, type ServiceError } from "@grpc/grpc-js";

export function grpcError(
  code: status,
  message: string,
  details?: string,
  metadata?: Record<string, string>
): ServiceError {
  const md = new Metadata();

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      md.set(key, value);
    }
  }

  return {
    name: status[code],
    code,
    message,
    details: details ?? message,
    metadata: md,
  };
}
```

---

## 2️⃣ Use it directly (very readable)

### `getUser`

```ts
async getUser(call, callback) {
  const { id } = call.request;

  if (!id) {
    return callback(
      grpcError(status.INVALID_ARGUMENT, "User ID is required"),
      null
    );
  }

  const user = await UserRepository.getUserById(id);

  if (!user) {
    return callback(
      grpcError(
        status.NOT_FOUND,
        "User not found",
        `User with id ${id} does not exist`
      ),
      null
    );
  }

  callback(null, user);
}
```

✔ No try/catch noise
✔ No casting
✔ No boilerplate

---

## 3️⃣ Central catch (optional)

```ts
async createUser(call, callback) {
  try {
    // logic
  } catch (err) {
    callback(
      grpcError(status.INTERNAL, "Internal server error"),
      null
    );
  }
}
```

---

# 🧠 When to use LEVEL 1

✔ Small–medium projects
✔ Few services
✔ Want readable code
✔ No complex domain logic

---

# 🚀 LEVEL 2 — *Advanced & Scalable (Enterprise-grade)*

This is what **large microservice systems** use.

---

## 1️⃣ Error Codes (machine-readable)

### `error-codes.ts`

```ts
export const ERROR_CODES = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_EXISTS: "USER_EXISTS",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;
```

---

## 2️⃣ Domain error class

```ts
import { status } from "@grpc/grpc-js";

export class AppError extends Error {
  constructor(
    public readonly code: status,
    public readonly errorCode: string,
    message: string,
    public readonly details?: string
  ) {
    super(message);
  }
}
```

---

## 3️⃣ Global mapper (ONE place)

```ts
import { Metadata, status } from "@grpc/grpc-js";
import type { sendUnaryData } from "@grpc/grpc-js";

export function mapGrpcError(
  error: unknown,
  callback: sendUnaryData<any>
) {
  if (error instanceof AppError) {
    const md = new Metadata();
    md.set("error_code", error.errorCode);

    return callback(
      {
        name: status[error.code],
        code: error.code,
        message: error.message,
        details: error.details ?? error.message,
        metadata: md,
      },
      null
    );
  }

  callback(
    {
      name: "Internal",
      code: status.INTERNAL,
      message: "Internal server error",
      details: "Unhandled error",
      metadata: new Metadata(),
    },
    null
  );
}
```

---

## 4️⃣ Service becomes VERY clean

```ts
async getUser(call, callback) {
  try {
    if (!call.request.id) {
      throw new AppError(
        status.INVALID_ARGUMENT,
        ERROR_CODES.VALIDATION_ERROR,
        "User ID is required"
      );
    }

    const user = await UserRepository.getUserById(call.request.id);

    if (!user) {
      throw new AppError(
        status.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND,
        "User not found"
      );
    }

    callback(null, user);
  } catch (err) {
    mapGrpcError(err, callback);
  }
}
```

---

## 5️⃣ Client-side power (very important)

Client can now do:

```ts
if (error.metadata?.get("error_code")?.[0] === "USER_NOT_FOUND") {
  // show specific UI
}
```

✔ Localization
✔ Retry logic
✔ Smart UI messages

---

# 🔥 LEVEL 3 — *Interceptor-based (MOST advanced)*

No try/catch in services **at all**.

### gRPC interceptor:

```ts
function errorInterceptor(handler) {
  return async (call, callback) => {
    try {
      await handler(call, callback);
    } catch (err) {
      mapGrpcError(err, callback);
    }
  };
}
```

Usage:

```ts
getUser: errorInterceptor(async (call, callback) => {
  // logic
});
```

---

# 🧠 Recommendation (from experience)

| Project Size          | Use     |
| --------------------- | ------- |
| Small                 | Level 1 |
| Medium                | Level 2 |
| Large / Microservices | Level 3 |

---

If you want next:

* 🔐 Auth interceptor
* 📊 Observability (metrics + tracing)
* 🔄 Retry-safe error design
* 🌍 gRPC ↔ REST error mapping

Just say which one 🚀

---

