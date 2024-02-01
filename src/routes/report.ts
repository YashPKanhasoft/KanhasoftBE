import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import ReportController from "../controllers/ReportController";

const router = Router();

router.get(
    "/:resource_status_id([0-9]+)",
    [checkJwt, checkRole(["ADMIN"])],
    ReportController.listAll
  );
export default router;
