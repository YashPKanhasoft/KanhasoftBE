import { Request, Response } from "express";

import { EmployeeHistroy, Project } from "../entity/index";
import { AppDataSource } from "../data-source";

class EmployeeHistroyController {

    static getOneById = async (req: Request, res: Response) => {
        //Get the ID from the url
        const emp_id: any = req.params.id;

        //Get the data from database
        const EmployeeHistroyRepository = AppDataSource.getRepository(EmployeeHistroy);
        const ProjectRepository = AppDataSource.getRepository(Project);

        try {
            const EmpHistroy = await EmployeeHistroyRepository.find({
                where: {
                    emp_id
                },

            });
            const projectIds = EmpHistroy.map(item => item.project_id);

            // Retrieve projects based on project IDs
            const projects = await ProjectRepository.findByIds(projectIds);

            // Combine project_id and project_title in EmpHistroy
            const combinedData = EmpHistroy.map(item => ({
                emp_id: item.emp_id,
                project_id: item.project_id,
                project_title: projects.find(project => project.id === item.project_id)?.project_name || 'Unknown',
                joiningDate: item.joiningDate,
                removeingDate: item.removeingDate,
            }));

            res.status(200).send({
                message: "Employee Histroy fetched successfully",
                error: false,
                data: combinedData,
            });
        } catch (error) {
            res
                .status(404)
                .send({ message: "Employee Histroy not found", error: true, data: {} });
        }
    };

}
export default EmployeeHistroyController;
