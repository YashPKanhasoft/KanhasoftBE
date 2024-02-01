import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Resource } from "./Resource";

@Entity()
@Unique(["project_name"])
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  project_description: string;

  @Column()
  project_name: string;

  @Column()
  client_name: string;

  @Column({nullable:true})
  No_of_resource_type: number;

  @Column({nullable:true})
  isSoftdelete: boolean;

  @Column({nullable:true})
  tracker: boolean;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Resource, (resources) => resources.project)
  resources: Resource[];
}
