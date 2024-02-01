import { Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { EmployeeHistroy, Project, Resource, Employee, Resource_Status, } from "../entity/index";

class ResourceController {
  static listAll = async (req: Request, res: Response) => {
    //Get resources from database
    const resourceRepository = AppDataSource.getRepository(Resource);
    const resources = await resourceRepository.find({
      relations: {
        employee: true,
        project: true,
      },
    });
    //Send the resources object
    res.status(200).send({
      message: "Resource fetched successfully",
      error: false,
      data: resources,
    });
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get the Resource from database
    const resourceRepository = AppDataSource.getRepository(Resource);
    try {
      const resource = await resourceRepository.findOneOrFail({
        where: {
          id,
        },
        relations: {
          employee: true,
          project: true,
        },
      });
      res.status(200).send({
        message: "Resource fetched successfully",
        error: false,
        data: resource,
      });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Resource not found", error: true, data: {} });
    }
  };

  static assignResource = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { employeeId, projectId, availability, role_type, resource_status_id, hours } = req.body;
    //Try to find Employee on database
    const employeeRepository = AppDataSource.getRepository(Employee);
    let employee;
    try {
      employee = await employeeRepository.findOneOrFail({
        where: { id: employeeId },
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({ message: "Employee not found", error: true });
      return;
    }
    //Try to find Project on database
    const projectRepository = AppDataSource.getRepository(Project);
    let project;
    try {
      project = await projectRepository.findOneOrFail({
        where: { id: projectId },
      });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send({ message: "project not found", error: true });
      return;
    }
    if (role_type === 'teamLeader' || role_type === 'srdeveloper') {
      
      const resource = new Resource();
      resource.employee = employee;
      resource.project = project;
      resource.availability = availability;
      resource.role_type = role_type;
      resource.resource_status_id = resource_status_id,
        resource.hours = hours
      resource.action = false
      const resourceRepository = AppDataSource.getRepository(Resource);
      const EmployeeHistroyRepository = AppDataSource.getRepository(EmployeeHistroy);
      let emphistroys = await EmployeeHistroyRepository.findOne({
        where: { emp_id: employeeId, project_id: projectId },
      });
      if (!emphistroys) {

        const emphistroy = new EmployeeHistroy();
        emphistroy.project_id = projectId;
        emphistroy.emp_id = employeeId;
        emphistroy.joiningDate = new Date();
        await EmployeeHistroyRepository.save(emphistroy);
      }

      await EmployeeHistroyRepository
        .createQueryBuilder()
        .update(EmployeeHistroy)
        .where({ emp_id: employeeId, project_id: projectId })
        .set({ joiningDate: new Date(), removeingDate: null })
        .execute()

      try {
        await resourceRepository.save(resource);
      } catch (e) {
        res.status(409).send({ message: e.message, error: true });
        return;
      }

      //If all ok, send 201 response
      res
        .status(201)
        .send({ message: "Resource assign successfully", error: false });
    } else {
      const resource = new Resource();
      resource.employee = employee;
      resource.project = project;
      resource.availability = availability;
      resource.role_type = role_type;
      resource.resource_status_id = resource_status_id,
        resource.hours = hours
      resource.action = true
      
      const resourceRepository = AppDataSource.getRepository(Resource);
      const EmployeeHistroyRepository = AppDataSource.getRepository(EmployeeHistroy);
      let emphistroys = await EmployeeHistroyRepository.findOne({
        where: { emp_id: employeeId, project_id: projectId },
      });
      if (!emphistroys) {

        const emphistroy = new EmployeeHistroy();
        emphistroy.project_id = projectId;
        emphistroy.emp_id = employeeId;
        emphistroy.joiningDate = new Date();
        await EmployeeHistroyRepository.save(emphistroy);
      }

      await EmployeeHistroyRepository
        .createQueryBuilder()
        .update(EmployeeHistroy)
        .where({ emp_id: employeeId, project_id: projectId })
        .set({ joiningDate: new Date(), removeingDate: null })
        .execute()

      try {
        await resourceRepository.save(resource);
      } catch (e) {
        res.status(409).send({ message: e.message, error: true });
        return;
      }

      //If all ok, send 201 response
      res
        .status(201)
        .send({ message: "Resource assign successfully", error: false });
    }


  };

  static deleteResource = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    if (!id) {
      res
        .status(404)
        .send({ message: "Resource Id must be required", error: true });
    }

    const resourceRepository = AppDataSource.getRepository(Resource);
    let resource: Resource;
    try {
      resource = await resourceRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({ message: "Resource not found", error: true });
      return;
    }
    let exitingresource = await resourceRepository.findOne({
      where: { id }, relations: ["employee", "project"],
    });

    const EmployeeHistroyRepository = AppDataSource.getRepository(EmployeeHistroy);

    await EmployeeHistroyRepository
      .createQueryBuilder()
      .update(EmployeeHistroy)
      .where({ emp_id: exitingresource.employee.id, project_id: exitingresource.project.id })
      .set({ removeingDate: new Date() })
      .execute();


    resourceRepository.delete(id);

    //After all send a 204 (no content, but accepted) response
    res
      .status(200)
      .send({ message: "Resource deleted successfully", error: false });
    return;
  };

  static editResource = async (req: Request, res: Response) => {

    const id: any = req.params.id;
    //Get parameters from the body
    let { availability, role_type, resource_status_id, hours } = req.body;

    const resourceRepository = AppDataSource.getRepository(Resource);
    let resource
    try {
      resource = await resourceRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({ message: "Resource not found", error: true });
      return;
    }

    resource.availability = availability;
    resource.role_type = role_type;
    resource.resource_status_id = resource_status_id,
      resource.hours = hours

    try {
      await resourceRepository.save(resource);
    } catch (e) {
      res.status(409).send({ message: e.message, error: true });
      return;
    }

    //If all ok, send 201 response
    res
      .status(201)
      .send({ message: "Resource update successfully", error: false });
  };

  static listAllResoureces_status = async (req: Request, res: Response) => {
    //Get resources from database
    const resourceRepository = AppDataSource.getRepository(Resource_Status);
    const resources = await resourceRepository.find({});

    //Send the resources object
    res.status(200).send({
      message: "Resource-status fetched successfully",
      error: false,
      data: resources,
    });
  };
}

export default ResourceController;
