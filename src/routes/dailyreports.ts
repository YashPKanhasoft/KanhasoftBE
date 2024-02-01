import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import DailyReportsController from "../controllers/DailyReportController";

const router = Router();
//crete new dailyreport
router.post("/", [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])], DailyReportsController.newDailyReport);

//Get all daily report
router.post("/list", [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])], DailyReportsController.listAll);

//Get all developer daily report
router.get("/developerlist", [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])], DailyReportsController.developerlistAll);

//Get developer user list
router.get("/developeruser-list", [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])], DailyReportsController.userlistAll);

//edit daily reports
router.patch(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])],
    DailyReportsController.editdailyreport
);

//delete daily reports
router.delete(
    "/:id([0-9]+)",
    [checkJwt, checkRole(["EMPLOYEE", "ADMIN"])],
    DailyReportsController.deletedailyreport
);
export default router;
