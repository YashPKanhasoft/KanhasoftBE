import { Request, Response } from "express";
import { validate } from "class-validator";

import { AppDataSource } from "../data-source";
import { Employee, User, } from "../entity/index";

class EmployeeController {
  static listAll = async (req: Request, res: Response) => {

    //Get employee from database
    const employeeRepository = AppDataSource.getRepository(Employee);
    const employees = await employeeRepository.find({
      select: {
        password: false,
      },
      where: {
        isSoftdelete: false
      },
      order: {
        id: 'DESC',
      },
    });

    //Send the users object
    res.status(200).send({
      message: "Employee fetched successfully",
      error: false,
      data: employees,
    });
  };

  static getOneById = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get the employee from database
    const employeeRepository = AppDataSource.getRepository(Employee);
    try {
      const employee = await employeeRepository.findOneOrFail({
        where: {
          id,
        },
        select: {
          password: false,
        },
      });
      res.status(200).send({
        message: "Employee fetched successfully",
        error: false,
        data: employee,
      });
    } catch (error) {
      res
        .status(404)
        .send({ message: "Employee not found", error: true, data: {} });
    }
  };

  static newEmployee = async (req: Request, res: Response) => {
    //Get parameters from the body
    let { name, password, phoneNumber, email } = req.body;
    let user = new User();
    user.username = name;
    user.password = password;
    user.email = email;
    user.role = 'Employee'

    user.hashPassword();
    
    const userRepository = AppDataSource.getRepository(User);
    try {
      let check =await userRepository.save(user);
    } catch (e) {
      res.status(409).send({ message: "email already in use", error: true });
      return;
    }
    let employee = new Employee();
    employee.name = name;
    employee.password = password;
    employee.email = email;
    employee.phoneNumber = phoneNumber;
    employee.isSoftdelete = false;
    employee.user_id = user.id

    //Validade if the parameters are ok
    const errors = await validate(employee);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Hash the password, to securely store on DB
    employee.hashPassword();

    //Try to save. If fails, the username is already in use
    const employeeRepository = AppDataSource.getRepository(Employee);

    try {
      await employeeRepository.save(employee);
    } catch (e) {
      res.status(409).send({ message: "email already in use", error: true });
      return;
    }

    //If all ok, send 201 response
    res
      .status(201)
      .send({ message: "Employee created successfully", error: false });
  };

  static editEmployee = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    //Get values from the body
    const { name, email, phoneNumber } = req.body;


    //Try to find Employee on database
    const employeeRepository = AppDataSource.getRepository(Employee);
    let employee;
    try {
      employee = await employeeRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      //If not found, send a 404 response
      res.status(404).send("Employee not found");
      return;
    }

    //Validate the new values on model
    employee.name = name;
    employee.email = email;
    employee.phoneNumber = phoneNumber;
    const errors = await validate(employee);
    if (errors.length > 0) {
      res.status(400).send(errors);
      return;
    }

    //Try to safe, if fails, that means email already in use
    try {
      await employeeRepository.save(employee);
    } catch (e) {
      res.status(409).send({ message: "Email already in use", error: true });
      return;
    }
    //After all send a 204 (no content, but accepted) response
    res
      .status(200)
      .send({ message: "Employee updated successfully", error: false });
    return;
  };

  static deleteEmployee = async (req: Request, res: Response) => {
    //Get the ID from the url
    const id: any = req.params.id;

    const employeeRepository = AppDataSource.getRepository(Employee);
    let employee: Employee;
    try {
      employee = await employeeRepository.findOneOrFail({ where: { id } });
    } catch (error) {
      res.status(404).send({ message: "Employee not found", error: true });
      return;
    }
    employeeRepository
      .createQueryBuilder()
      .update(Employee)
      .where({ id })
      .set({ isSoftdelete: true })
      .returning('*')
      .execute();

    //After all send a 204 (no content, but accepted) response
    res
      .status(200)
      .send({ message: "Employee deleted successfully", error: false });
    return;
  };
}

export default EmployeeController;
