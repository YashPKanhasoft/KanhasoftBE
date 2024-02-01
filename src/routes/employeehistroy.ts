import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import EmployeeHistroyController from "../controllers/EmployeeHistroyController";

const router = Router();

router.get(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["ADMIN"])],
    EmployeeHistroyController.getOneById
);

export default router;