import { db } from "@/config/db";
import { ipToData, userAgentDetector } from "@/utils/metadataDetector";
import { sessions, type Session } from "@/utils/schema";
import { randomUUID } from "crypto";


export abstract class SessionRepository {
  static async createSession(authId: string, ipAddress: string, userAgent: string) {

    const ipData = ipToData(ipAddress);
    const userAgentData = userAgentDetector(userAgent);

    const data: Session = {
      authId,
      sessionTokenHash: randomUUID(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress,
      city: ipData.city,
      country: ipData.country,
      deviceInfo: userAgentData,
      userAgent,
      latitude: `${ipData.latitude}`,
      longitude: `${ipData.longitude}`,
    }

    const [sessionData] = await db
      .insert(sessions)
      .values(data)
      .returning();

    return sessionData;
  }
}
