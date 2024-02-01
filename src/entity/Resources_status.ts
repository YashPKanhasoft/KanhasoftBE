import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()

export class Resource_Status {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    resources_Name: String;

    @Column()
    colour: String;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column()
    @UpdateDateColumn()
    updatedAt: Date;
}