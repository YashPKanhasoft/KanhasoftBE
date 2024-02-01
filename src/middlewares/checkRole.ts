import { Request, Response, NextFunction } from "express";

import { User } from "../entity/User";
import { AppDataSource } from "../data-source";

export const checkRole = (roles: Array<string>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Get the user ID from previous midleware
    const id = res.locals.jwtPayload.userId;

    //Get user role from the database
    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(401).send({ message: error.message, error: true });
    }
    //Check if array of authorized roles includes the user's role
    if (roles.indexOf(user.role.toUpperCase()) > -1) next();
    else
      res.status(401).send({ message: "Only admin can access", error: true });
  };
};
