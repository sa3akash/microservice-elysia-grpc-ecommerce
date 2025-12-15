Perfect — now you’re talking about **propagating gRPC errors through your API Gateway** so the client receives **proper HTTP status codes and messages**. Let me break it down step by step.

---

# 1️⃣ gRPC → API Gateway mapping

In your microservices setup:

* gRPC returns a `ServiceError`:

  ```ts
  {
    code: status.NOT_FOUND, // gRPC status code
    message: "User not found",
    metadata: { error_code: ["NOT_FOUND"] },
  }
  ```
* API Gateway (Express/Fastify/NestJS) converts this to an HTTP response:

  * `status.NOT_FOUND` → HTTP 404
  * `error_code` → optional machine-readable code
  * `message` → human-readable message

---

# 2️⃣ Map gRPC status to HTTP status

Create a helper in your **API Gateway**:

```ts
import { status, type ServiceError } from "@grpc/grpc-js";

export function grpcToHttpStatus(err: ServiceError): number {
  switch (err.code) {
    case status.NOT_FOUND:
      return 404;
    case status.INVALID_ARGUMENT:
      return 400;
    case status.ALREADY_EXISTS:
      return 409;
    case status.UNAUTHORIZED:
      return 401;
    case status.FAILED_PRECONDITION:
      return 412;
    case status.INTERNAL:
    default:
      return 500;
  }
}
```

---

# 3️⃣ Extract error code / metadata

```ts
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

# 4️⃣ Wrap gRPC call in a helper (avoid repeating try/catch)

```ts
export async function callGrpc<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err.code !== undefined) {
      // gRPC error
      throw extractGrpcError(err);
    }
    // fallback
    throw { code: 500, message: "Internal Server Error" };
  }
}
```

---

# 5️⃣ Use in your UserService (API Gateway layer)

```ts
import { callGrpc } from "@/utils/grpc-client";

export abstract class UserService {
  static async getUserById(id: string) {
    return callGrpc(() =>
      new Promise((resolve, reject) => {
        userClient.getUser({ id }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      })
    );
  }

  static async createUser(body: UserModel.signUpRequestType) {
    return callGrpc(() =>
      new Promise((resolve, reject) => {
        userClient.createUser(
          {
            name: body.name,
            email: body.email,
            password: body.password,
            phone: body.phone,
          },
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

# 6️⃣ API Gateway Express route

```ts
app.get("/users/:id", async (req, res) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.json(user);
  } catch (err: any) {
    res
      .status(err.code ?? 500)
      .json({ message: err.message, errorCode: err.errorCode });
  }
});
```

---

# ✅ Advantages of this approach

1. **gRPC error codes map cleanly to HTTP codes**
2. **Machine-readable error codes** (`error_code`) for frontend or API Gateway logs
3. **No duplicated try/catch in multiple endpoints**
4. **Safe & typed** errors
5. Works across all microservices

---

# 🔥 Pro Tip

You can create a **shared middleware** in API Gateway:

```ts
app.use((err, req, res, next) => {
  if (err.code && err.message) {
    res.status(err.code).json({
      errorCode: err.errorCode,
      message: err.message,
      details: err.details,
    });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
```

Then every gRPC call automatically flows through it.

---

If you want, I can make a **full working template**:

* gRPC UserService
* API Gateway wrapper
* Proper HTTP status mapping
* ErrorCode propagation to client

All fully typed with TypeScript and ready for **microservices**.

Do you want me to do that?
