import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()

export class DailyReport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    project_id: number;

    @Column()
    hours: number;

    @Column({ length: 10485760,nullable:true })
    description: string

    @CreateDateColumn() 
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;

}