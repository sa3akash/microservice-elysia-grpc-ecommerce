import { describe, expect, it, mock, beforeEach } from "bun:test";
import { AuthServiceController } from "@/services/auth.controller";
import { AuthService } from "@/services/auth.services";

// Mock AuthService
mock.module("@/services/auth.services", () => ({
    AuthService: {
        SignUp: mock(),
        login: mock(),
    }
}));


describe("AuthServiceController", () => {
    let controller: AuthServiceController;

    beforeEach(() => {
        controller = new AuthServiceController();
        (AuthService.SignUp as any).mockClear();
        (AuthService.login as any).mockClear();
    });

    it("should handle signup request successfully", (done) => {
        const mockRequest = {
            email: "test@example.com",
            password: "Password123!",
            name: "Test User",
        };

        const mockUserResponse = {
            id: "user-123",
            email: "test@example.com",
        };

        (AuthService.SignUp as any).mockResolvedValue(mockUserResponse);

        const call: any = {
            request: mockRequest,
        };

        controller.signup(call, (error, response) => {
            expect(error).toBeNull();
            expect(response).toBeDefined();
            expect(response?.email).toBe("test@example.com");
            expect(AuthService.SignUp).toHaveBeenCalled();
            done();
        });
    });

    it("should handle login request successfully", (done) => {
        const mockRequest = {
            identifier: "test@example.com",
            password: "Password123!",
        };

        const mockLoginResponse = {
            authSuccess: {
                tokens: { accessToken: "abc", refreshToken: "xyz" },
                user: { email: "test@example.com" }
            }
        };

        (AuthService.login as any).mockResolvedValue(mockLoginResponse);

        const call: any = {
            request: mockRequest,
            metadata: {
                get: (key: string) => key === "ip" ? ["127.0.0.1"] : ["test-agent"]
            }
        };

        controller.login(call, (error, response) => {
            expect(error).toBeNull();
            expect(response as any).toEqual(mockLoginResponse);
            expect(AuthService.login).toHaveBeenCalled();
            done();
        });
    });
});
