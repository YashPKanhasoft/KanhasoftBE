import { Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { Employee, Resource } from "../entity/index";
import { In, Not } from "typeorm";
class ReportController {
    static listAll = async (req: Request, res: Response) => {
        //Get resources from database
        const id = parseInt(req.params.resource_status_id, 10);

        const resourceRepository = AppDataSource.getRepository(Resource);
        const free_employeeRepository = AppDataSource.getRepository(Employee);

        try {
            let resources: any[];

            switch (id) {
                case 1:
                case 2:
                    resources = await resourceRepository.find({
                        where: {
                            resource_status_id: id,
                        },
                        relations: {
                            employee: true,
                            project: true,
                        },
                    });
                    break;
                case 3:
                    const employeeResources = await resourceRepository.find({
                        relations: {
                            employee: true,
                            project: true,
                        },
                    });
                    const employeeIds = employeeResources.map(item => item.employee.id);

                    if (employeeIds.length > 0) {
                        resources = await free_employeeRepository.find({
                            where: {
                                id: Not(In(employeeIds)),
                            },
                        });
                    } else {
                        resources = []; // No need to query if there are no employeeIds
                    }
                    break;
                case 4:
                    resources = await resourceRepository.find({
                        where: {
                            role_type: 'projectmanager',
                        },
                        relations: {
                            employee: true,
                            project: true,
                        },
                    });
                    break;
                case 5:
                    resources = await resourceRepository.find({
                        where: {
                            role_type: 'teamLeader',
                        },
                        relations: {
                            employee: true,
                            project: true,
                        },
                    });
                    break;
                case 6:
                    resources = await resourceRepository.find({
                        where: {
                            role_type: In(['projectmanager', 'teamLeader']),
                        },
                        relations: {
                            employee: true,
                            project: true,
                        },
                    });
                    break;
                default:
                    throw new Error('Invalid resource_status_id');
            }

            const modifiedResources = resources.map((item: any) => {
                if (item instanceof Employee) {
                    // Handle the case where the item is an Employee entity
                    return {
                        resource_status_id: id,
                        role_type: 'employee',
                        employee: {
                            name: item.name,
                            email: item.email,
                        },
                        project: null, // Since it's an employee, there might not be a project
                    };
                } else {
                    // Handle the case where the item is a Resource entity
                    return {
                        resource_status_id: item.resource_status_id,
                        role_type: item.role_type,
                        employee: {
                            name: item.employee.name,
                        },
                        project: {
                            project_name: item.project.project_name,
                        },
                    };
                }
            });


            res.status(201).send({
                message: "Report fetched successfully",
                error: false,
                data: modifiedResources,
            });
        } catch (error) {
            res.status(404).send({
                message: "Resource not found",
                error: true,
                data: {},
            });
        }
    }
}
export default ReportController;
