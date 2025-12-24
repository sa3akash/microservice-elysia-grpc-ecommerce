import { describe, expect, it, mock, beforeEach, beforeAll } from "bun:test";
import { AuthService } from "./auth.services";
import { AuthRepository } from "@/repository/auth.repository";
import { SessionRepository } from "@/repository/sesstion.repository";
import { AppError } from "@ecom/common";
import bcrypt from "bcryptjs";

// Mock Repositories
mock.module("@/repository/auth.repository", () => ({
    AuthRepository: {
        getUserByEmail: mock(),
        createUser: mock(),
        getUserByIdenfire: mock(),
    }
}));

mock.module("@/repository/sesstion.repository", () => ({
    SessionRepository: {
        createSession: mock(),
    }
}));


describe("AuthService", () => {
    const mockUser = {
        id: "user-123",
        email: "test@example.com",
        password: bcrypt.hashSync("password123", 10),
        name: "Test User",
        isActive: true,
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockSession = {
        id: "session-123",
        userId: "user-123",
        sessionTokenHash: "hash",
        expiresAt: new Date(),
        ipAddress: "127.0.0.1",
        userAgent: "bun-test",
    };

    beforeEach(() => {
        // Reset mocks
        (AuthRepository.getUserByEmail as any).mockClear();
        (AuthRepository.createUser as any).mockClear();
        (AuthRepository.getUserByIdenfire as any).mockClear();
        (SessionRepository.createSession as any).mockClear();
    });

    describe("SignUp", () => {
        it("should create a new user successfully", async () => {
            (AuthRepository.getUserByEmail as any).mockResolvedValue(null);
            (AuthRepository.createUser as any).mockResolvedValue(mockUser);

            const result = await AuthService.SignUp({
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            });

            expect(AuthRepository.getUserByEmail).toHaveBeenCalledWith("test@example.com");
            expect(AuthRepository.createUser).toHaveBeenCalled();
            expect(result as any).toEqual(mockUser);
        });

        it("should throw error if user already exists", async () => {
            (AuthRepository.getUserByEmail as any).mockResolvedValue(mockUser);

            expect(AuthService.SignUp({
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            })).rejects.toThrow("User already exists");
        });
    });

    describe("Login", () => {
        it("should login successfully and return tokens", async () => {
            (AuthRepository.getUserByIdenfire as any).mockResolvedValue(mockUser);
            (SessionRepository.createSession as any).mockResolvedValue(mockSession);

            const result = await AuthService.login(
                { identifier: "test@example.com", password: "password123" },
                "127.0.0.1",
                "bun-test"
            );

            expect(result.authSuccess).toBeDefined();
            expect(result.authSuccess?.tokens?.accessToken).toBeDefined();
            expect(result.authSuccess?.user?.email).toBe("test@example.com");
        });

        it("should throw error for invalid credentials", async () => {
             (AuthRepository.getUserByIdenfire as any).mockResolvedValue(null);

             expect(AuthService.login(
                { identifier: "wrong@example.com", password: "password123" },
                "127.0.0.1",
                "bun-test"
            )).rejects.toThrow("Invalid credentials");
        });

         it("should throw error for wrong password", async () => {
             (AuthRepository.getUserByIdenfire as any).mockResolvedValue(mockUser);

             expect(AuthService.login(
                { identifier: "test@example.com", password: "wrongpassword" },
                "127.0.0.1",
                "bun-test"
            )).rejects.toThrow("Invalid credentials");
        });
    });
});
