import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import ProjectController from "../controllers/ProjectController";

const router = Router();

//Get all users
router.get("/", [checkJwt, checkRole(["ADMIN","EMPLOYEE"])], ProjectController.listAll);

// Get one project
router.get(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ProjectController.getOneById
);

//Create a new project
router.post(
  "/",
  [checkJwt, checkRole(["ADMIN"])],
  ProjectController.newProject
);

//Edit one project
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ProjectController.editProject
);

//Delete one project
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  ProjectController.deleteProject
);

router.get(
  "/history/:project_id([0-9]+)",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ProjectController.projecthistroy
);

export default router;
