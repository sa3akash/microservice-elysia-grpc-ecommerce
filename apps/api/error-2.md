Ah perfect 😎 — if you’re using **Elysia.js**, the same principle applies, but with **Elysia route handlers and middleware** instead of Express.

Here’s a **production-ready pattern** for microservices + gRPC error mapping in Elysia.

---

# 1️⃣ Map gRPC status to HTTP

```ts
import { status, type ServiceError } from "@grpc/grpc-js";

export function grpcToHttpStatus(err: ServiceError): number {
  switch (err.code) {
    case status.NOT_FOUND: return 404;
    case status.INVALID_ARGUMENT: return 400;
    case status.ALREADY_EXISTS: return 409;
    case status.UNAUTHORIZED: return 401;
    case status.FAILED_PRECONDITION: return 412;
    case status.INTERNAL:
    default:
      return 500;
  }
}

export function extractGrpcError(err: ServiceError) {
  const errorCode = err.metadata?.get("error_code")?.[0] as string | undefined;
  return {
    code: grpcToHttpStatus(err),
    message: err.message,
    errorCode,
    details: err.details,
  };
}
```

---

# 2️⃣ Wrap gRPC calls in a helper

```ts
export async function callGrpc<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err.code !== undefined) {
      throw extractGrpcError(err);
    }
    throw { code: 500, message: "Internal Server Error" };
  }
}
```

---

# 3️⃣ UserService client layer (with Elysia)

```ts
import { userClient } from "@/clients/users.client";
import type { UserModel } from "./model";
import { callGrpc } from "@/utils/grpc-client";
import type { User, GetUserRequest, CreateUserRequest } from "@ecom/common";

export abstract class UserService {
  static async getUserById(id: string): Promise<User> {
    return callGrpc(() =>
      new Promise((resolve, reject) => {
        userClient.getUser({ id } as GetUserRequest, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      })
    );
  }

  static async createUser(body: UserModel.signUpRequestType): Promise<User> {
    return callGrpc(() =>
      new Promise((resolve, reject) => {
        userClient.createUser(
          {
            name: body.name,
            email: body.email,
            password: body.password,
            phone: body.phone,
          } as CreateUserRequest,
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        );
      })
    );
  }
}
```

---

# 4️⃣ Elysia route example with global error handling

```ts
import { Elysia } from "elysia";
import { UserService } from "./services/user.service";

const app = new Elysia();

// Middleware to catch gRPC errors
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.code ?? 500;
    ctx.body = {
      message: err.message ?? "Internal Server Error",
      errorCode: err.errorCode,
      details: err.details,
    };
  }
});

app.get("/users/:id", async ({ params }) => {
  return UserService.getUserById(params.id);
});

app.post("/users", async ({ body }) => {
  return UserService.createUser(body);
});

app.listen(3000);
```

---

# ✅ Benefits

1. **One place handles errors** (middleware)
2. **HTTP status is mapped from gRPC codes**
3. **Error code & details propagate automatically**
4. **Minimal boilerplate in route handlers**
5. Fully typed with TypeScript

---

# 🔥 Pro Tips for Microservices + Elysia

* Use **gRPC interceptors** to standardize errors in all services.
* Pass `error_code` and `details` in metadata for **API Gateway / frontend**.
* Use `ctx.log` or OpenTelemetry for structured **tracing & metrics**.
* For pagination / filtering, return `{ data: [...], total: N }` for API clients.

---

If you want, I can create a **full Elysia + gRPC microservice template** with:

* UserService gRPC client & server
* Error handling interceptor
* API Gateway routes
* Proper HTTP & machine-readable error propagation

This will be **ready-to-use for multiple microservices**.

Do you want me to build that?
