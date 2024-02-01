import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import EmployeeRolesController from "../controllers/EmployeeRolesController";
const router = Router();

//Get all resources
router.get("/", [checkJwt, checkRole(["ADMIN"])], EmployeeRolesController.listAllEmployeeRoles);

export default router;