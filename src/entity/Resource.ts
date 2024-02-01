import { Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Employee } from "./Employee";
import { Project } from "./Project";

@Entity()
export class Resource {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Employee, (employee) => employee.resources)
  employee: Employee;


  @ManyToOne(() => Project, (project) => project.resources)
  project: Project;

  @Column()
  availability: string;

  @Column({ nullable: true })
  resource_status_id: number;

  @Column({ nullable: true })
  action: boolean;
  
  @Column()
  @Length(4, 100)
  role_type: string;

  @Column({ nullable: true })
  hours: number;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
