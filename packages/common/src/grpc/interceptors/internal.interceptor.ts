import {
  Metadata,
  ResponderBuilder,
  ServerInterceptingCall,
  ServerListenerBuilder,
  status,
  type ServerInterceptingCallInterface,
  type ServerMethodDefinition,
} from "@grpc/grpc-js";
import { INTERNAL_GATEWAY_KEY } from "../../interfaces";

function validateAuthorizationMetadata(metadata: Metadata) {
  const gatewayKey = metadata.get(INTERNAL_GATEWAY_KEY)[0];
  if (!gatewayKey || gatewayKey !== process.env["INTERNAL_GATEWAY_VALUE"]) {
    return false;
  }
  return true;
}

export const internalInterceptor = (
  _methodDescriptor: ServerMethodDefinition<any, any>,
  call: ServerInterceptingCallInterface
) => {
  const listener = new ServerListenerBuilder()
    .withOnReceiveMetadata((metadata, next) => {
      if (validateAuthorizationMetadata(metadata)) {
        next(metadata);
      } else {
        metadata.set("message", "Invalid Gateway Key");
        call.sendStatus({
          code: status.UNAUTHENTICATED,
          details: "Invalid Gateway Key",
          metadata,
        });
        return;
      }
    })
    .build();
  const responder = new ResponderBuilder()
    .withStart((next) => {
      next(listener);
    })
    .build();
  return new ServerInterceptingCall(call, responder);
};
