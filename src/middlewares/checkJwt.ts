import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  //Get the jwt token from the head
  const authToken = <string>req?.headers?.authorization;
  let tokenArray = authToken?.split(" ") || "";
  const token = tokenArray[1];

  if (!token) {
    return res.status(401).send({ message: "Token is required", error: true });
  }

  let jwtPayload;

  //Try to validate the token and get data
  try {
    jwtPayload = <any>jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        //If token is not valid, respond with 401 (unauthorized)
        res
          .status(401)
          .send({ message: "Unauthorized: Token expired!!", error: true });
        return;
      }
      return decoded;
    });
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    console.log("error", error);
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send({ message: error.message, error: true });
    return;
  }

  //The token is valid for 1 hour
  //We want to send a new token on every request
  const { userId, email } = jwtPayload;

  const newToken = jwt.sign(
    { userId, email },
    config.jwtSecret,
    { expiresIn: "1h" }
  );
  
  res.setHeader("token", newToken);

  //Call the next middleware or controller
  next();
};
