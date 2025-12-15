import {
  type ServerUnaryCall,
  type sendUnaryData,
  type UntypedServiceImplementation,
  status,
} from "@grpc/grpc-js";
import { AppError } from ".";

export type GrpcCall = ServerUnaryCall<any, any>;
export type GrpcCallback = sendUnaryData<any>;
export interface GrpcContext {
  methodName: string;
}

export type GrpcHandler = (
  call: GrpcCall,
  callback: GrpcCallback
) => void | Promise<void>;

export interface GrpcServerInterceptor {
  intercept(
    call: GrpcCall,
    callback: GrpcCallback,
    next: GrpcHandler,
    context: GrpcContext
  ): void | Promise<void>;
}

export const applyInterceptors = (
  serviceImpl: UntypedServiceImplementation,
  interceptors: GrpcServerInterceptor[]
): UntypedServiceImplementation => {
  const wrappedImpl: UntypedServiceImplementation = {};

  for (const [name, method] of Object.entries(serviceImpl)) {
    if (typeof method !== "function") {
      wrappedImpl[name] = method;
      continue;
    }

    wrappedImpl[name] = (call: GrpcCall, callback: GrpcCallback) => {
      let index = -1;
      const context: GrpcContext = { methodName: name };

      const dispatch = async (
        i: number,
        capturedCall: GrpcCall,
        capturedCallback: GrpcCallback
      ) => {
        if (i <= index) throw new Error("next() called multiple times");
        index = i;

        if (i === interceptors.length) {
          // Final handler (original method)
          return await (method as Function).call(
            serviceImpl,
            capturedCall,
            capturedCallback
          );
        }

        const interceptor = interceptors[i];
        await interceptor?.intercept(
          capturedCall,
          capturedCallback,
          (nextCall, nextCallback) => {
            return dispatch(i + 1, nextCall, nextCallback);
          },
          context
        );
      };

      dispatch(0, call, callback).catch((err) => {
        // Global safety net if an interceptor or handler throws without using callback
        // However, grpc-js usually expects callback(err)
        throw new AppError(
          status.INTERNAL,
          "Internal Server Error",
          JSON.stringify(err)
        );
        // callback({
        //     code: 13, // INTERNAL
        //     details: "Internal Server Error"
        // }, null);
      });
    };
  }

  return wrappedImpl;
};
