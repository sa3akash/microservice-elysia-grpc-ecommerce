import { AuthRepository } from "@/repository/auth.repository";
import bcrypt from "bcryptjs";

import { logger } from "@/utils/logger";
import { AppError, type SignupRequest } from "@ecom/common";
import { status } from "@grpc/grpc-js";

export abstract class AuthService {
 
  static async SignUp(data:SignupRequest){

    const userExist = await AuthRepository.getUserByEmail(data.email);

    
    if (userExist) {
      throw new AppError(status.ALREADY_EXISTS, "User already exists");
    }

    const user = await AuthRepository.createUser({
      ...data,
      password: bcrypt.hashSync(data.password, 10),
    });

    logger.info("user", user);

    //todo: send verification email

    //todo: rabbitmq send user created event
    return user
  }

  
}
