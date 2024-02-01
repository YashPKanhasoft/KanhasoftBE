import { Request, Response } from "express";
import { validate } from "class-validator";

import { User } from "../entity/index";
import { AppDataSource } from "../data-source";

class UserController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find({
      select: ["id", "username", "role"], //We dont want to send the passwords on response
    });

    //Send the users object
    res.status(200).send({
      message: "User fetched successfully",
      error: false,
      data: users,
    });
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get the user from database
    const userRepository = AppDataSource.getRepository(User);
    try {
      const user = await userRepository.findOneOrFail({
        where: {
          id,
        },
        select: ["id", "username", "role"],
      });
      res.status(200).send({
        message: "User fetched successfully",
        error: false,
        data: user,
      });
    } catch (error) {
      res
        .status(404)
        .send({ message: "User not found", error: true, data: {} });
    }
  };

  static newUser = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { username, password, role, email } = req.body;
    let user = new User();
    user.username = username;
    user.password = password;
    user.email = email;
    user.role = role;

    //Validade if the parameters are ok
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Hash the password, to securely store on DB
    user.hashPassword();

    //Try to save. If fails, the username is already in use
    const userRepository = AppDataSource.getRepository(User);
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send({ message: "username already in use", error: true });
      return;
    }

    //If all ok, send 201 response
    res
      .status(201)
      .send({ message: "User created successfully", error: false });
  };

  static editUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get values from the body
    const { username, role } = req.body;

    //Try to find user on database
    const userRepository = AppDataSource.getRepository(User);
    let user;
    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("User not found");
      return;
    }

    //Validate the new values on model
    user.username = username;
    user.role = role;
    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means email already in use
    try {
      await userRepository.save(user);
    } catch (e) {
      res.status(409).send({ message: "email already in use", error: true });
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res
      .status(204)
      .send({ message: "User updated successfully", error: false });
  };

  static deleteUser = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    const userRepository = AppDataSource.getRepository(User);
    let user: User;
    try {
      user = await userRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({ message: "User not found", error: true });
      return;
    }
    userRepository.delete(id);

    //After all send a 204 (no content, but accepted) response
    res
      .status(204)
      .send({ message: "User deleted successfully", error: false });
  };
}

export default UserController;
