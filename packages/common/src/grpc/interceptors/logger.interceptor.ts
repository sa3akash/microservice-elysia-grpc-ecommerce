import {
  ResponderBuilder,
  ServerInterceptingCall,
  ServerListenerBuilder,
  type ServerInterceptingCallInterface,
  type ServerMethodDefinition,
} from "@grpc/grpc-js";
import { logger } from "../../utils";

export function loggingInterceptor(
  _methodDescriptor: ServerMethodDefinition<any, any>,
  call: ServerInterceptingCallInterface
) {
  const listener = new ServerListenerBuilder()
    .withOnReceiveMessage((message, next) => {
      logger.info(
        `Receive a new call at ${new Date().toISOString()}`,
        message
      );
      next(message);
    })
    .build();

  const responder = new ResponderBuilder()
    .withStart((next) => {
      next(listener);
    })
    .withSendMessage((message, next) => {
      logger.info(
        `Send a response at ${new Date().toISOString()}`,
        message
      );
      next(message);
    })
    // .withSendStatus((statusObj, next) => {
    //   console.log("statusObj", statusObj);
    //   if (statusObj.code !== status.OK) {
    //     logger.error(
    //       `gRPC Error in ${methodDescriptor.originalName}:`,
    //       JSON.stringify(statusObj, null, 2)
    //     );
    //   }
    //   next(statusObj);
    // })
    .build();
  return new ServerInterceptingCall(call, responder);
}
