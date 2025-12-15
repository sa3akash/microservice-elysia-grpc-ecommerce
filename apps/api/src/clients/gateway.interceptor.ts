import { type Interceptor, InterceptingCall } from "@grpc/grpc-js";

export const gatewayInterceptor: Interceptor = (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: (metadata, listener, next) => {
      metadata.add("x-api-key", "gateway");
      metadata.add("x-gateway-id", "one");
      next(metadata, listener);
    },
  });
};
