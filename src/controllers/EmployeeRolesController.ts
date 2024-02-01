import { Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { Employee_Roles } from "../entity/index";

class EmployeeRolesController {

    static listAllEmployeeRoles = async (req: Request, res: Response) => {
        //Get employee roles from database
        const EmployeeRolesRepository = AppDataSource.getRepository(Employee_Roles);
        const EmployeeRoles = await EmployeeRolesRepository.find({});

        //Send the employee roles object
        res.status(200).send({
            message: "employee roles fetched successfully",
            error: false,
            data: EmployeeRoles,
        });
    };
}

export default EmployeeRolesController;
