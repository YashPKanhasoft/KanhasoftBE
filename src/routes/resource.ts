import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";
import ResourceController from "../controllers/ResourceController";

const router = Router();

//Get all resources
router.get("/", [checkJwt, checkRole(["ADMIN","EMPLOYEE"])], ResourceController.listAll);

// Get one resource
router.get(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN"])],
  ResourceController.getOneById
);

//Create a new resource
router.post(
  "/assign",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ResourceController.assignResource
);

//Delete resource
router.delete(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ResourceController.deleteResource
);

router.get("/status", [checkJwt, checkRole(["ADMIN","EMPLOYEE"])], ResourceController.listAllResoureces_status);

//Edit one projectResourceController
router.patch(
  "/:id([0-9]+)",
  [checkJwt, checkRole(["ADMIN","EMPLOYEE"])],
  ResourceController.editResource
);
export default router;
