import { describe, expect, it } from "bun:test";
import { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } from "./tokens";
import jwt from "jsonwebtoken";
import { config } from "@/config/dotenv";

describe("Token Utils", () => {
    const mockUser = {
        authId: "123",
        sessionId: "456",
        sessionTokenHash: "abc",
    };

    const mockRefreshUser = {
        authId: "123",
        ipAddress: "127.0.0.1",
        userAgent: "test-agent",
    };

    it("should generate a valid access token", () => {
        const token = generateAccessToken(mockUser);
        expect(token).toBeDefined();
        const decoded = jwt.verify(token, config.JWT_SECRET);
        expect(decoded).toMatchObject(mockUser);
    });

    it("should generate a valid refresh token", () => {
        const token = generateRefreshToken(mockRefreshUser);
        expect(token).toBeDefined();
        const decoded = jwt.verify(token, config.JWT_SECRET_REFRESH);
        expect(decoded).toMatchObject(mockRefreshUser);
    });

    it("should verify a valid access token", () => {
        const token = jwt.sign(mockUser, config.JWT_SECRET);
        const decoded = verifyAccessToken(token);
        expect(decoded).toMatchObject(mockUser);
    });

    it("should throw error for invalid access token", () => {
        const token = "invalid.token.here";
        expect(() => verifyAccessToken(token)).toThrow();
    });

    it("should verify a valid refresh token", () => {
        const token = jwt.sign(mockRefreshUser, config.JWT_SECRET_REFRESH);
        const decoded = verifyRefreshToken(token);
        expect(decoded).toMatchObject(mockRefreshUser);
    });
    
     it("should throw error for invalid refresh token", () => {
        const token = "invalid.token.here";
        expect(() => verifyRefreshToken(token)).toThrow();
    });
});
