import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { UsersService } from "./user.services";
import { UserRepository } from "../repository/user.repository";
import { status } from "@grpc/grpc-js";

// Mocking static methods of UserRepository
// We will spy on them or mock implementations directly on the class if possible, 
// or use bun's mock.module if we need to replace the import.
// For simplicity with static methods, we can just replace the function on the class 
// because it is a singleton/static export.

describe("UsersService", () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
  });
  
  afterEach(() => {
    mock.restore();
  });

  describe("getUser", () => {
    test("should return NOT_FOUND if user does not exist", async () => {
      // Mock failure
      const originalGetUserById = UserRepository.getUserById;
      UserRepository.getUserById = mock(async () => null);

      const call: any = { request: { id: "123" } };
      
      return new Promise<void>((resolve) => {
          const callback = (err: any, response: any) => {
            expect(err).toBeDefined();
            expect(err.code).toBe(status.NOT_FOUND);
            expect(err.message).toContain("User not found with ID 123");
            
            // Restore
            UserRepository.getUserById = originalGetUserById;
            resolve();
          };
          
          usersService.getUser(call, callback);
      });
    });

    test("should return user if exists", async () => {
      const mockUser = { id: "123", name: "Test" };
      const originalGetUserById = UserRepository.getUserById;
      UserRepository.getUserById = mock(async () => mockUser as any);

      const call: any = { request: { id: "123" } };
      
      return new Promise<void>((resolve) => {
          const callback = (err: any, response: any) => {
            expect(err).toBeNull();
            expect(response).toEqual(mockUser);
            
            UserRepository.getUserById = originalGetUserById;
            resolve();
          };
          
          usersService.getUser(call, callback);
      });
    });
  });

  describe("createUser", () => {
      test("should return ALREADY_EXISTS if email is taken", async () => {
          const originalGetUserByEmail = UserRepository.getUserByEmail;
          UserRepository.getUserByEmail = mock(async () => ({ id: "1" } as any)); // User exists

          const call: any = { request: { name: "Test", email: "existing@test.com", password: "pw", phone: "123" } };

          return new Promise<void>((resolve) => {
              const callback = (err: any, response: any) => {
                  expect(err).toBeDefined();
                  expect(err.code).toBe(status.ALREADY_EXISTS);
                  expect(err.message).toContain("User with email existing@test.com already exists");

                  UserRepository.getUserByEmail = originalGetUserByEmail;
                  resolve();
              };
              usersService.createUser(call, callback);
          });
      });
  });
});
