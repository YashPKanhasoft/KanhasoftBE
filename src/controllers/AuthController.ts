import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";

import { User } from "../entity/index";
import config from "../config/config";
import { AppDataSource } from "../data-source";

class AuthController {
  static login = async (req: Request, res: Response) => {
    //Check if username and password are set
    let { email, password } = req.body;
    if (!(email && password)) {
      res
        .status(400)
        .send({ message: "Email and Password is required", error: true });
    }

    //Get user from database
    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { email } });
    } catch (error) {
      res.status(401).send({ message: "User does not exits", error: true });
      return;
    }

    //Check if encrypted password match
    if (!user?.checkIfUnencryptedPasswordIsValid(password)) {
      res.status(401).send({ message: "Invalid password", error: true });
      return;
    }

    //Sing JWT, valid for 1 hour
    const token = jwt.sign(
      { userId: user?.id || "", email: user?.email || "" },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    delete user?.password;
    user["token"] = token;

    //Send the jwt in the response
    res
      .status(200)
      .send({ message: "Logged in successfull", error: false, data: user });
  };

  static changePassword = async (req: Request, res: Response) => {
    //Get ID from JWT
    const id = res.locals.jwtPayload.userId;

    //Get parameters from the body
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
      res.status(400).send();
    }

    //Get user from the database
    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail(id);
    } catch (error) {
      res.status(401).send();
    }

    //Check if old password matchs
    if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
      res.status(401).send();
      return;
    }

    //Validate de model (password lenght)
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }
    //Hash the new password and save
    user.hashPassword();
    userRepository.save(user);

    res.status(204).send();
  };
}
export default AuthController;
