import {
  ResponderBuilder,
  ServerInterceptingCall,
  ServerListenerBuilder,
  type ServerInterceptingCallInterface,
  type ServerMethodDefinition,
} from "@grpc/grpc-js";
import { AUTH_ID, AUTH_ROLE } from "../../interfaces";

export const authInterceptor = (
  _methodDescriptor: ServerMethodDefinition<any, any>,
  call: ServerInterceptingCallInterface
) => {
  const listener = new ServerListenerBuilder()
    .withOnReceiveMetadata((metadata, next) => {
      const [userId] = metadata.get(AUTH_ID) as string[];
      const [role] = metadata.get(AUTH_ROLE) as string[];
      if (userId && role) {
        (call as any).user = userId;
        (call as any).role = role;
      }
      next(metadata);
    })
    .build();
  const responder = new ResponderBuilder()
    .withStart((next) => {
      next(listener);
    })
    .build();
  return new ServerInterceptingCall(call, responder);
};
