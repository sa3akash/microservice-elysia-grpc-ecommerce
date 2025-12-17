import { config } from "@/config/dotenv";
import { INTERNAL_GATEWAY_KEY } from "@ecom/common";
import { type Interceptor, InterceptingCall } from "@grpc/grpc-js";

export const gatewayInterceptor: Interceptor = (options, nextCall) => {
  return new InterceptingCall(nextCall(options), {
    start: (metadata, listener, next) => {
      metadata.add(INTERNAL_GATEWAY_KEY, config.INTERNAL_GATEWAY_VALUE);
      next(metadata, listener);
    },
  });
};
