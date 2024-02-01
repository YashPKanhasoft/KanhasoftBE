import { Request, Response } from "express";
import { validate } from "class-validator";
import { AppDataSource } from "../data-source";
import { Employee, EmployeeHistroy, Project, Resource, Resource_Status, User } from "../entity/index";
import { Brackets, In } from "typeorm";

class ProjectController {
  static listAll = async (req: Request, res: Response) => {
    //Get users from database
    const projectRepository = AppDataSource.getRepository(Project);
    const resource_statusRepository = AppDataSource.getRepository(Resource_Status);
    const userRepository = AppDataSource.getRepository(User);

    const id = res.locals.jwtPayload.userId;
    const userRole = await userRepository.findOne({ where: { id: id } });
    try {
      if (userRole.role === "Employee") {
        if (req.query.isdailyReport === "false") {

          const employeeRepository = AppDataSource.getRepository(Employee);
          const resoureceRepository = AppDataSource.getRepository(Resource);

          const checkemployee = await employeeRepository.findOne({ where: { email: userRole.email } })
          const checkpm = await resoureceRepository.find({ where: { employee: { id: checkemployee.id } }, relations: { project: true } });

          const resourceIds = checkpm.map(item => item.project.id);

          const projects = await projectRepository
            .createQueryBuilder("project")
            .leftJoinAndSelect("project.resources", "resource")
            .leftJoinAndSelect("resource.employee", "employee")
            .orderBy("project.createdAt", "DESC")
            .andWhere("project.isSoftdelete = :isSoftdelete", { isSoftdelete: false })
            .andWhere(
              new Brackets((qb) => {
                qb.andWhere("employee.isSoftdelete = :isSoftdelete", { isSoftdelete: false });
                qb.orWhere("resource.employee IS NULL"); // Add any additional conditions if needed
              })
            )
            .andWhereInIds(resourceIds) // Assuming you want to fetch projects associated with the resources
            .getMany();


          let check = projects.map(items => items.resources.map(ites => ites.resource_status_id)).flat();
          let find = await resource_statusRepository.findByIds(check);
          const colourMap = new Map(find.map(item => [item.id, item.colour]));
          const NameMap = new Map(find.map(item => [item.id, item.resources_Name]));

          // Update the projects with colour information
          const projectsWithColour = projects.map(project => ({
            ...project,
            resources: project.resources.map(resource => ({
              id: resource.id,
              availability: resource.availability,
              resource_status_id: resource.resource_status_id,
              resource_name: NameMap.get(resource.resource_status_id),
              role_type: resource.role_type,
              hours: resource.hours,
              action: resource.action,
              colour: colourMap.get(resource.resource_status_id),
              createdAt: resource.createdAt,
              updatedAt: resource.updatedAt,
              employee: {
                id: resource.employee.id,
                name: resource.employee.name,
                email: resource.employee.email,
                user_login_id: resource.employee.user_id,
                password: resource.employee.password,
                phoneNumber: resource.employee.phoneNumber,
                isSoftdelete: resource.employee.isSoftdelete,
                joiningDate: resource.employee.joiningDate,
                removeDate: resource.employee.removeDate,
                createdAt: resource.employee.createdAt,
                updatedAt: resource.employee.updatedAt,
              },
            })),
          }));
          console.log(projectsWithColour);

          //Send the projects object
          res.status(200).send({
            message: "Project fetched successfully",
            error: false,
            data: projectsWithColour,
          });
        } else if (req.query.isdailyReport === "true") {

          const employeeRepository = AppDataSource.getRepository(Employee);
          const resoureceRepository = AppDataSource.getRepository(Resource);

          const checkemployee = await employeeRepository.findOne({ where: { email: userRole.email } })
          const checkpm = await resoureceRepository.find({ where: { employee: { id: checkemployee.id }, role_type: 'projectmanager' }, relations: { project: true } });

          const resourceIds = checkpm.map(item => item.project.id);

          const projects = await projectRepository
            .createQueryBuilder("project")
            .leftJoinAndSelect("project.resources", "resource")
            .leftJoinAndSelect("resource.employee", "employee")
            .orderBy("project.createdAt", "DESC")
            .andWhere("project.isSoftdelete = :isSoftdelete", { isSoftdelete: false })
            .andWhere(
              new Brackets((qb) => {
                qb.andWhere("employee.isSoftdelete = :isSoftdelete", { isSoftdelete: false });
                qb.orWhere("resource.employee IS NULL"); // Add any additional conditions if needed
              })
            )
            .andWhereInIds(resourceIds) // Assuming you want to fetch projects associated with the resources
            .getMany();


          let check = projects.map(items => items.resources.map(ites => ites.resource_status_id)).flat();
          let find = await resource_statusRepository.findByIds(check);
          const colourMap = new Map(find.map(item => [item.id, item.colour]));
          const NameMap = new Map(find.map(item => [item.id, item.resources_Name]));

          // Update the projects with colour information
          const projectsWithColour = projects.map(project => ({
            ...project,
            resources: project.resources.map(resource => ({
              id: resource.id,
              availability: resource.availability,
              resource_status_id: resource.resource_status_id,
              resource_name: NameMap.get(resource.resource_status_id),
              role_type: resource.role_type,
              hours: resource.hours,
              action: resource.action,
              colour: colourMap.get(resource.resource_status_id),
              createdAt: resource.createdAt,
              updatedAt: resource.updatedAt,
              employee: {
                id: resource.employee.id,
                name: resource.employee.name,
                email: resource.employee.email,
                user_login_id: resource.employee.user_id,
                password: resource.employee.password,
                phoneNumber: resource.employee.phoneNumber,
                isSoftdelete: resource.employee.isSoftdelete,
                joiningDate: resource.employee.joiningDate,
                removeDate: resource.employee.removeDate,
                createdAt: resource.employee.createdAt,
                updatedAt: resource.employee.updatedAt,
              },
            })),
          }));

          //Send the projects object
          res.status(200).send({
            message: "Project fetched successfully",
            error: false,
            data: projectsWithColour,
          });
        }
      } else if (userRole.role === "Admin") {

        const projects = await projectRepository
          .createQueryBuilder("project")
          .leftJoinAndSelect("project.resources", "resource")
          .leftJoinAndSelect("resource.employee", "employee")
          .orderBy("project.updatedAt", "DESC")
          .andWhere("project.isSoftdelete = :isSoftdelete", { isSoftdelete: false })
          .andWhere(
            new Brackets((qb) => {
              qb.andWhere("employee.isSoftdelete = :isSoftdelete", { isSoftdelete: false });
              qb.orWhere("resource.employee IS NULL"); // Add any additional conditions if needed
            })
          )
          .getMany();

        let check = projects.map(items => items.resources.map(ites => ites.resource_status_id)).flat();
        let find = await resource_statusRepository.findByIds(check);
        const colourMap = new Map(find.map(item => [item.id, item.colour]));
        const NameMap = new Map(find.map(item => [item.id, item.resources_Name]));

        // Update the projects with colour information
        const projectsWithColour = projects.map(project => ({
          ...project,
          resources: project.resources.map(resource => ({
            id: resource.id,
            availability: resource.availability,
            resource_status_id: resource.resource_status_id,
            resource_name: NameMap.get(resource.resource_status_id),
            role_type: resource.role_type,
            hours: resource.hours,
            colour: colourMap.get(resource.resource_status_id),
            createdAt: resource.createdAt,
            updatedAt: resource.updatedAt,
            employee: {
              id: resource.employee.id,
              name: resource.employee.name,
              email: resource.employee.email,
              password: resource.employee.password,
              phoneNumber: resource.employee.phoneNumber,
              isSoftdelete: resource.employee.isSoftdelete,
              joiningDate: resource.employee.joiningDate,
              removeDate: resource.employee.removeDate,
              createdAt: resource.employee.createdAt,
              updatedAt: resource.employee.updatedAt,
            },
          })),
        }));

        //Send the projects object
        res.status(200).send({
          message: "Project fetched successfully",
          error: false,
          data: projectsWithColour,
        });
      }
    } catch (error) {
      //Send the projects object
      res.status(400).send({
        message: error.message,
        error: true,
      });
    }
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;
    //Get the project from database
    const projectRepository = AppDataSource.getRepository(Project);
    try {
      const project = await projectRepository.findOneOrFail({
        where: {
          id
        },
      });
      res.status(200).send({
        message: "Project fetched successfully",
        error: false,
        data: project,
      });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Project not found", error: true, data: {} });
    }
  };
  static newProject = async (req: Request, res: Response) => {

    const projectRepository = AppDataSource.getRepository(Project);
    try {
      let { project_description, project_name, client_name, No_of_resource_type, tracker } = req.body;
      // Check if a project with the same name and isSoftdelete=true exists
      let existingProject = await projectRepository.findOne({ where: { project_name, isSoftdelete: true } });

      if (existingProject) {
        // If a project is found, update it
        existingProject.project_description = project_description;
        existingProject.client_name = client_name;
        existingProject.isSoftdelete = false;
        existingProject.No_of_resource_type = No_of_resource_type;
        existingProject.tracker = tracker;

        await projectRepository.save(existingProject);

        return res.status(200).send({ message: "Project created successfully", error: false });
      } else {
        // If no project with isSoftdelete=true is found, check if a project with isSoftdelete=false exists
        existingProject = await projectRepository.findOne({ where: { project_name, isSoftdelete: false } });

        if (existingProject) {
          // If a project with isSoftdelete=false exists, return a conflict response
          return res.status(409).send({ message: "Project already in use", error: true });
        } else {
          // If no project is found, create a new project
          const newProject = projectRepository.create({
            project_description,
            project_name,
            client_name,
            isSoftdelete: false,
            No_of_resource_type,
            tracker,
          });

          await projectRepository.save(newProject);

          return res.status(201).send({ message: "Project created successfully", error: false });
        }
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).send({ message: "Internal server error", error: true });
    }
  };

  static editProject = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get values from the body
    const { project_name, project_description, client_name, No_of_resource_type, tracker } = req.body;

    //Try to find Project on database
    const projectRepository = AppDataSource.getRepository(Project);
    let project;
    try {
      project = await projectRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("Project not found");
      return;
    }

    //Validate the new values on model
    project.project_name = project_name;
    project.project_description = project_description;
    project.client_name = client_name;
    project.No_of_resource_type = No_of_resource_type;
    project.tracker = tracker

    const errors = await validate(project);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means email already in use
    try {
      await projectRepository.save(project);
    } catch (e) {
      res
        .status(409)
        .send({ message: "Project Name already exit", error: true });
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res
      .status(200)
      .send({ message: "Project updated successfully", error: false });

    return;
  };

  static deleteProject = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    const projectRepository = AppDataSource.getRepository(Project);
    let project: Project;
    try {
      project = await projectRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({ message: "Project not found", error: true });
      return;
    }
    projectRepository
      .createQueryBuilder()
      .update(Project)
      .where({ id })
      .set({ isSoftdelete: true })
      .returning('*')
      .execute();

    //After all send a 204 (no content, but accepted) response
    res
      .status(200)
      .send({ message: "Project deleted successfully", error: false });
    return;
  };
  static projecthistroy = async (req: Request, res: Response) => {
    //Get the ID from the url
    const project_id: any = req.params.project_id;

    //Get the project from database
    const EmployeeHistroyRepository = AppDataSource.getRepository(EmployeeHistroy);
    const EmployeeRepository = AppDataSource.getRepository(Employee);

    try {
      const EmpHistroy = await EmployeeHistroyRepository.find({
        where: {
          project_id
        },

      });
      const EmployeeIds = EmpHistroy.map(item => item.emp_id);

      // Retrieve projects based on project IDs
      const projects = await EmployeeRepository.findByIds(EmployeeIds);

      // Combine project_id and project_title in EmpHistroy
      const combinedData = EmpHistroy.map(item => ({
        emp_id: item.emp_id,
        name: projects.find(project => project.id === item.emp_id)?.name || 'Unknown',
        joiningDate: item.joiningDate,
        removeingDate: item.removeingDate,
      }));

      res.status(200).send({
        message: "project Histroy fetched successfully",
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

export default ProjectController;
