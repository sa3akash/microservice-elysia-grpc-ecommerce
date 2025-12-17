import {
  ResponderBuilder,
  ServerInterceptingCall,
  status,
  type ServerInterceptingCallInterface,
  type ServerMethodDefinition,
} from "@grpc/grpc-js";
import { logger } from "../../utils";

export const globalErrorInterceptor = (
  methodDescriptor: ServerMethodDefinition<any, any>,
  call: ServerInterceptingCallInterface
) => {
  const responder = new ResponderBuilder()
    .withSendStatus((statusObj, next) => {
      if (statusObj.code !== status.OK) {
        logger.error("GRPC Error Interceptor", {
          message: "GRPC Error from Interceptor",
          method: methodDescriptor.originalName,
          status: statusObj,
        });
      }
      next(statusObj);
    })
    .build();
  return new ServerInterceptingCall(call, responder);
};
