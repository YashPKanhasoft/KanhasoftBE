import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()

export class EmployeeHistroy {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    project_id: number;

    @Column()
    emp_id: number;

    @Column()
    joiningDate: Date;

    @Column({nullable:true})
    removeingDate: Date;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}