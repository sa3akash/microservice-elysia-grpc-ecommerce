import { describe, expect, it, mock, beforeEach } from "bun:test";
import { authResolvers } from "./resolvers";
import { AuthService } from "../auth.service";

// Mock AuthService in apps/api
mock.module("../auth.service", () => ({
    AuthService: {
        signUp: mock(),
        login: mock(),
    },
}));

describe("Auth Resolvers", () => {
     beforeEach(() => {
        (AuthService.signUp as any).mockClear();
        (AuthService.login as any).mockClear();
    });

    describe("Mutation.createUser", () => {
        it("should call AuthService.signUp and return result", async () => {
            const mockInput = {
                email: "test@example.com",
                password: "Password123!",
                name: "Test User"
            };
            const mockResponse = {
                message: "Success",
                email: "test@example.com",
                userId: "123"
            };

            (AuthService.signUp as any).mockResolvedValue(mockResponse);

            // validate wrapper might return the handler, or be the handler. 
            // Depending on implementation of validate. 
            // Assuming validate returns a function (parent, args, ctx) => Result
            
            // Note: If validate does schema validation, we might need to pass valid data.
            // Also if validate relies on 't' from Elysia, it might be complex to invoke standalone.
            // However, typical resolver pattern allows direct invocation if we mock validation or pass valid data.
            
            const resolver = authResolvers.Mutation.createUser;
            
            const result = await resolver({}, { input: mockInput }, {} as any, {} as any);
            
            expect(AuthService.signUp).toHaveBeenCalledWith(mockInput);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("Mutation.login", () => {
        it("should call AuthService.login, set cookies, and return user", async () => {
            const mockInput = {
                identifier: "test@example.com",
                password: "Password123!"
            };

            const mockAuthResponse = {
                authSuccess: {
                    tokens: {
                        accessToken: "access-token",
                        refreshToken: "refresh-token",
                        accessTokenExpiresAt: new Date(Date.now() + 3600000), // 1h
                        refreshTokenExpiresAt: new Date(Date.now() + 7200000), // 2h
                    },
                    user: {
                        userId: "u-123",
                        email: "test@example.com",
                        emailVerified: true,
                        name: "User",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                }
            };

            (AuthService.login as any).mockResolvedValue(mockAuthResponse);

             const mockCookie = {
                accessToken: { set: mock() },
                refreshToken: { set: mock() },
            };

            const context: any = {
                ip: "127.0.0.1",
                userAgent: "test-agent",
                cookie: mockCookie
            };

            const resolver = authResolvers.Mutation.login;
            const result = await resolver({}, { input: mockInput }, context,{});

            expect(AuthService.login).toHaveBeenCalledWith(mockInput, "127.0.0.1", "test-agent");
            
            // Check cookies
            expect(mockCookie.accessToken.set).toHaveBeenCalled();
            expect(mockCookie.refreshToken.set).toHaveBeenCalled();

            // Check result structure
            expect(result.result).toBeDefined();
            expect(result.result.id).toBe("u-123");
            expect(result.result.__typename).toBe("User");
        });
    });
});
