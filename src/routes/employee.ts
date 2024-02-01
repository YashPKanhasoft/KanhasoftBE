import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import EmployeeController from "../controllers/EmployeeController";

const router = Router();

//Get all users
router.get("/", [checkJwt, checkRole(["ADMIN","EMPLOYEE"])], EmployeeController.listAll);

// Get one user
router.get(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  EmployeeController.getOneById
);

//Create a new user
router.post(
  "/",
  [checkJwt, checkRole(["ADMIN"])],
  EmployeeController.newEmployee
);

//Edit one user
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  EmployeeController.editEmployee
);

//Delete one user
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  EmployeeController.deleteEmployee
);

export default router;
