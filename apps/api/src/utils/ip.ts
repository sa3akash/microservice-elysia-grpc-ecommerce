import type { Server } from "bun";

export const getClientIp = (request: Request, server?: Server<any> | null) => {
  // if cloudefile use
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) {
    return ip;
  }

  // 1. Try Bun's native IP extraction (works for localhost/direct)
  if (server) {
    const socketAddress = server.requestIP(request);
    if (socketAddress) {
      return socketAddress.address;
    }
  }

  // 2. Try Standard Headers (works for proxies)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor?.split(",")[0]?.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
};
