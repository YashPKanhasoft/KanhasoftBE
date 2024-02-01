import { Router, Request, Response } from "express";
import auth from "./auth";
import user from "./user";
import employee from "./employee";
import project from "./project";
import resource from "./resource";
import employeehistroy from "./employeehistroy";
import report from "./report";
import employeeroles from "./employeeroles";
import dailyreports from "./dailyreports";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/employee", employee);
routes.use("/project", project);
routes.use("/resource", resource);
routes.use("/employeehistroy", employeehistroy);
routes.use("/report", report);
routes.use("/employeeroles", employeeroles);
routes.use("/dailyreport", dailyreports);


export default routes;
