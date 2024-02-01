import { Length } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import { Resource } from "./Resource";

@Entity()
@Unique(["email"])
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  @Length(4, 100)
  password: string;

  @Column()
  @Length(10)
  phoneNumber: string;

  @Column({nullable:true})
  isSoftdelete: boolean;

  @Column({nullable:true})
  joiningDate: Date;

  @Column({nullable:true})
  removeDate: Date;

  @Column({nullable:true})
  user_id: number;
  
  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  @OneToMany(() => Resource, (resources) => resources.employee)
  resources: Resource[];
}
