import { Request, Response } from "express";
import { validate } from "class-validator";
import { AppDataSource } from "../data-source";
import { DailyReport, Employee, Project, Resource, User } from "../entity/index";
import { Between, In, Not } from "typeorm";

class DaliyReportsController {
    static newDailyReport = async (req: Request, res: Response) => {
        const id = res.locals.jwtPayload.userId;

        //Get parameters from the body
        let { project_id, hours, description } = req.body;
        let dailyReport = new DailyReport();
        dailyReport.user_id = id;
        dailyReport.project_id = project_id;
        dailyReport.hours = hours;
        dailyReport.description = description;

        //Validade if the parameters are ok
        const errors = await validate(dailyReport);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }
        //Try to save. If fails, the username is already in use
        const dailyReportRepository = AppDataSource.getRepository(DailyReport);
        await dailyReportRepository.save(dailyReport);

        //If all ok, send 201 response
        res
            .status(201)
            .send({ message: "daily reports created successfully", error: false });
    }
    static listAll = async (req: Request, res: Response) => {
        //Get users from database
        let { isdailyReport } = req.body;
        if (isdailyReport === "daily") {
            let limit: any = req.query.limit || 10;
            let page: any = req.query.page || 1;
    
            const dailyReportRepository = AppDataSource.getRepository(DailyReport);
            const projectRepository = AppDataSource.getRepository(Project);

            const id = res.locals.jwtPayload.userId;

            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0); // Set time to the beginning of the day

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);  // Set time to the end of the day
            const dailyReport = await dailyReportRepository.find({
                where: {
                    user_id: id,
                    createdAt: Between(startOfDay, endOfDay),
                },
                order: {
                    id: 'DESC',
                },
                take: limit,
                skip: (page - 1) * limit,
            });
            let idsname = dailyReport.map(item => item.project_id)
            let projectids = await projectRepository.findByIds(idsname);
            const projectnames = new Map(projectids.map(item => [item.id, item.project_name]));

            const dailyReportWithproject = dailyReport.map(dailyReport => {
                const projectId = dailyReport.project_id;
                const projectName = projectnames.get(projectId);

                return {
                    id: dailyReport.id,
                    user_id: dailyReport.user_id,
                    project_id: projectId,
                    project_name: projectName,
                    hours: dailyReport.hours,
                    description: dailyReport.description,
                    created_date: dailyReport.createdAt
                };
            });

            const totalCount = await dailyReportRepository.count({
                where: {
                    user_id: id,
                    createdAt: Between(startOfDay, endOfDay)
                },
            });
            const totalPages = Math.ceil(totalCount / limit);

            let result = {
                data: dailyReportWithproject,
                page: page.toString(),
                totalPages: totalPages.toString(),
                totalCount: totalCount.toString()
            };

            //Send the users object
            res.status(200).send({
                message: "daily report fetched successfully",
                error: false,
                ...result,
            });
        } else if (isdailyReport === "all") {
            
            let limit: any = req.query.limit || 10;
            let page: any = req.query.page || 1;
            const dailyReportRepository = AppDataSource.getRepository(DailyReport);
            const projectRepository = AppDataSource.getRepository(Project);

            const id = res.locals.jwtPayload.userId;

            const dailyReport = await dailyReportRepository.find({
                where: {
                    user_id: id,
                },
                order: {
                    id: 'DESC',
                },
                take: limit,
                skip: (page - 1) * limit,
            });
            let idsname = dailyReport.map(item => item.project_id)
            let projectids = await projectRepository.findByIds(idsname);
            const projectnames = new Map(projectids.map(item => [item.id, item.project_name]));

            const dailyReportWithproject = dailyReport.map(dailyReport => {
                const projectId = dailyReport.project_id;
                const projectName = projectnames.get(projectId);

                return {
                    id: dailyReport.id,
                    user_id: dailyReport.user_id,
                    project_id: projectId,
                    project_name: projectName,
                    hours: dailyReport.hours,
                    description: dailyReport.description,
                    created_date: dailyReport.createdAt
                };
            });

            const totalCount = await dailyReportRepository.count({
                where: {
                    user_id: id,
                },
            });
            const totalPages = Math.ceil(totalCount / limit);

            let result = {
                data: dailyReportWithproject,
                page: page.toString(),
                totalPages: totalPages.toString(),
                totalCount: totalCount.toString()
            };

            //Send the users object
            res.status(200).send({
                message: "daily report fetched successfully",
                error: false,
                ...result,
            });

        }
    }

    static developerlistAll = async (req: Request, res: Response) => {

        //Get users from database
        let limit: any = req.query.limit || 10;
        let page: any = req.query.page || 1;
        let project_id: any = req.query.project || null;
        let user_id: any = req.query.user || null;
        let fromDate: any =
            req.query.fromDate !== undefined ? req.query.fromDate : undefined;
        let toDate: any =
            req.query.toDate !== undefined ? req.query.toDate : undefined;

        // Parse query parameters into Date objects if they exist
        const toDateParam: Date | null = toDate ? new Date(toDate) : null;
        const fromDateParam: Date | null = fromDate ? new Date(fromDate) : null;
        if (fromDateParam) {
            fromDateParam.setDate(fromDateParam.getDate() + 1);
        }
        const dailyReportRepository = AppDataSource.getRepository(DailyReport);
        const projectRepository = AppDataSource.getRepository(Project);
        const userRepository = AppDataSource.getRepository(User);
        const employeeRepository = AppDataSource.getRepository(Employee);
        const resourceRepository = AppDataSource.getRepository(Resource);

        const id = res.locals.jwtPayload.userId;

        const userdata = await userRepository.findOne({ where: { id } });
        if (userdata.role === "Employee") {
            const employeedata = await employeeRepository.findOne({
                where: { email: userdata.email },
            });
            console.log(employeedata);

            const checkpm = await resourceRepository.find({
                where: {
                    employee: { id: employeedata?.id },
                    role_type: "projectmanager",
                },
                relations: { project: true },
            });

            let projectids = checkpm.map((items) => items.project.id).flat();
            let project_id: any = req.query.project || In(projectids);

            const projectdata = await resourceRepository.find({
                where: {
                    project: {
                        id: In(projectids),
                    },
                },
                relations: { employee: true },
            });
            const usersdata = await userRepository.find({
                where: { email: In(projectdata.map((item) => item.employee.email)) },
            });

            let data = usersdata.map((item) => item.id);
            let ids = data.filter((userId) => userId !== id);

            const whereCondition: { [key: string]: any } = {
                user_id: In(ids),
                project_id,
            };
            // Add date conditions if fromDateParam and toDateParam are defined
            if (fromDateParam && toDateParam) {
                whereCondition.createdAt = Between(toDateParam, fromDateParam);
            }

            if (user_id !== null) {
                // Add user_id condition only if user_id is not null
                Object.assign(whereCondition, { user_id });
            }

            const dailyReport = await dailyReportRepository.find({
                where: whereCondition,
                order: {
                    id: "DESC",
                },
                take: limit,
                skip: (page - 1) * limit,
            });
            let users = await userRepository.find({
                where: { id: In(dailyReport.map((item) => item.user_id)) },
            });
            const userNamesMap = new Map(
                users.map((user) => [user.id, user.username])
            );

            let idsname = dailyReport.map((item) => item.project_id);
            let projectidss = await projectRepository.findByIds(idsname);
            const projectnames = new Map(
                projectidss.map((item) => [item.id, item.project_name])
            );

            // Populate projectsByUserMap
            const projectsByUserMap = new Map();

            dailyReport.forEach((report) => {
                const userId = report.user_id;
                const projectId = report.project_id;
                const projectName = projectnames.get(projectId);

                const projectDetails = {
                    project_id: projectId,
                    project_name: projectName,
                    hours: report.hours,
                    description: report.description,
                    created_date: new Date(report.createdAt), // Convert the string to a Date object
                };

                if (projectsByUserMap.has(userId)) {
                    projectsByUserMap.get(userId).push(projectDetails);
                } else {
                    projectsByUserMap.set(userId, [projectDetails]);
                }
            });

            // Group projects by date within each user
            const dailyReportWithproject = Array.from(projectsByUserMap).flatMap(([userId, projects]) => {
                const projectsByDate = projects.reduce((acc, project) => {
                    const dateKey = project.created_date.toISOString().split('T')[0]; // Extract date from the timestamp
                    if (acc.has(dateKey)) {
                        acc.get(dateKey).push(project);
                    } else {
                        acc.set(dateKey, [project]);
                    }
                    return acc;
                }, new Map());

                return Array.from(projectsByDate).map(([date, projects]) => ({
                    user_id: userId,
                    user_name: userNamesMap.get(userId),
                    date: date,
                    projects: projects,
                }));
            });

            const totalCount = dailyReportWithproject.length
            const totalPages = Math.ceil(totalCount / limit);

            let result = {
                data: dailyReportWithproject,
                page: page.toString(),
                totalPages: totalPages.toString(),
                totalCount: totalCount.toString(),
            };

            //Send the users object
            res.status(200).send({
                message: "daily report fetched successfully",
                error: false,
                ...result,
            });
        } else if (userdata.role === "Admin") {
            const whereCondition: { [key: string]: any } = {
                project_id,
                user_id: Not(id),
            };

            // Add date conditions if fromDateParam and toDateParam are defined
            if (fromDateParam && toDateParam) {
                whereCondition.createdAt = Between(toDateParam, fromDateParam);
            }
            if (user_id !== null) {
                // Add user_id condition only if user_id is not null
                Object.assign(whereCondition, { user_id });
            }
            const dailyReport = await dailyReportRepository.find({
                where: whereCondition,
                order: {
                    id: "DESC",
                },
                take: limit,
                skip: (page - 1) * limit,
            });

            let users = await userRepository.find({
                where: { id: In(dailyReport.map((item) => item.user_id)) },
            });
            const userNamesMap = new Map(
                users.map((user) => [user.id, user.username])
            );

            let idsname = dailyReport.map((item) => item.project_id);
            let projectidss = await projectRepository.findByIds(idsname);
            const projectnames = new Map(
                projectidss.map((item) => [item.id, item.project_name])
            );
            const projectsByUserMap = new Map();

            dailyReport.forEach((report) => {
                const userId = report.user_id;
                const projectId = report.project_id;
                const projectName = projectnames.get(projectId);

                const projectDetails = {
                    project_id: projectId,
                    project_name: projectName,
                    hours: report.hours,
                    description: report.description,
                    created_date: new Date(report.createdAt), // Convert the string to a Date object
                };

                if (projectsByUserMap.has(userId)) {
                    projectsByUserMap.get(userId).push(projectDetails);
                } else {
                    projectsByUserMap.set(userId, [projectDetails]);
                }
            });

            // Group projects by date within each user
            const dailyReportWithproject = Array.from(projectsByUserMap).flatMap(([userId, projects]) => {
                const projectsByDate = projects.reduce((acc, project) => {
                    const dateKey = project.created_date.toISOString().split('T')[0]; // Extract date from the timestamp
                    if (acc.has(dateKey)) {
                        acc.get(dateKey).push(project);
                    } else {
                        acc.set(dateKey, [project]);
                    }
                    return acc;
                }, new Map());

                return Array.from(projectsByDate).map(([date, projects]) => ({
                    user_id: userId,
                    user_name: userNamesMap.get(userId),
                    date: date,
                    projects: projects,
                }));
            });

            const totalCount = dailyReportWithproject.length
            const totalPages = Math.ceil(totalCount / limit);

            let result = {
                data: dailyReportWithproject,
                page: page.toString(),
                totalPages: totalPages.toString(),
                totalCount: totalCount.toString(),
            };

            //Send the users object
            res.status(200).send({
                message: "daily report fetched successfully",
                error: false,
                ...result,
            });
        }
    };
    static userlistAll = async (req: Request, res: Response) => {
        //Get users from database
        const userRepository = AppDataSource.getRepository(User);
        const resourceRepository = AppDataSource.getRepository(Resource);
        const employeeRepository = AppDataSource.getRepository(Employee);

        const id = res.locals.jwtPayload.userId;

        const usersrole = await userRepository.findOne({
            where: { id }
        });
        if (usersrole.role === 'Admin') {
            const project_id: any = req.query.id || null;

            const dtaproject = await resourceRepository.find({
                where: {
                    project: {
                        id: project_id
                    },
                    employee: {
                        email: Not(usersrole.email)
                    }
                },
                relations: { employee: true },
                select: ["employee"],
            });
            const modifiedResponse = dtaproject.map(resource => ({
                id: resource.employee.user_id,
                username: resource.employee.name,
            }));

            //Send the users object
            res.status(200).send({
                message: "User fetched successfully",
                error: false,
                data: modifiedResponse,
            });
        } else {
            const id: any = req.query.id || null;

            const employeedata = await employeeRepository.findOne({
                where: { email: usersrole.email },
            });
            const checkpm = await resourceRepository.find({
                where: {
                    employee: { id: employeedata.id },
                },
                relations: { project: true },
            });
            let projectids = checkpm.map((items) => items.project.id).flat();

            const whereCondition: { [key: string]: any } = {
                id: In(projectids),
            };

            if (id !== null) {
                // Add user_id condition only if user_id is not null
                Object.assign(whereCondition, { id });
            }

            const projectdata = await resourceRepository.find({
                where: {
                    project: whereCondition,
                    employee: {
                        email: Not(usersrole.email)
                    }
                },
                relations: { employee: true },
            });

            const modifiedResponse = projectdata.map(resource => ({
                id: resource.employee.user_id,
                username: resource.employee.name,
            }));

            //Send the users object
            res.status(200).send({
                message: "User fetched successfully",
                error: false,
                data: modifiedResponse,
            });
        }
    };
    static editdailyreport = async (req: Request, res: Response) => {

        //Get users from database
        const dailyReportRepository = AppDataSource.getRepository(DailyReport);

        //Get the ID from the url
        const id: any = req.params.id;

        //Get values from the body
        let { project_id, hours, description } = req.body;

        //Try to find Employee on database
        let dailyReport;
        try {
            dailyReport = await dailyReportRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            //If not found, send a 404 response
            res.status(404).send("daily report not found");
            return;
        }

        //Validate the new values on model
        dailyReport.project_id = project_id;
        dailyReport.hours = hours;
        dailyReport.description = description;
        const errors = await validate(dailyReport);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        //Try to safe, if fails, that means email already in use
        await dailyReportRepository.save(dailyReport);

        //After all send a 204 (no content, but accepted) response
        res
            .status(200)
            .send({ message: "daily report updated successfully", error: false });
        return;
    }
    static deletedailyreport = async (req: Request, res: Response) => {
        //Get the ID from the url
        const id: any = req.params.id;

        const dailyreportRepository = AppDataSource.getRepository(DailyReport);
        let dailyReport: DailyReport;
        try {
            dailyReport = await dailyreportRepository.findOneOrFail({ where: { id } });
        } catch (error) {
            res.status(404).send({ message: "daily report not found", error: true });
            return;
        }
        dailyreportRepository.delete(id);
        res
            .status(200)
            .send({ message: "daily report deleted successfully", error: false });
        return;
    };
}
export default DaliyReportsController;