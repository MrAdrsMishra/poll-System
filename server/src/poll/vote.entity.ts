import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Vote{
   @PrimaryGeneratedColumn('uuid')
   id:string;
   @Column()
   clientToken:string;
   @Column()
   pollId:string;
   @Column()
   userHash:string;
}