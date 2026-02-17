import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Poll {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column()
    statement: string;
    @Column({ default: {}, type: "json" })
    options: Record<string, number>;
    @Column()
    validTill: Date;
    @CreateDateColumn()
    createdAt: Date;
}

