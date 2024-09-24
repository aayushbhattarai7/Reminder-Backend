import { Column, Entity } from "typeorm";
import Base from "./base.entity";
@Entity('user')
export class User extends Base{
    @Column({name:'full_name'})
    name: string

    @Column({ type: 'date' })
    DOB: Date;
    
    @Column({ name: 'email', unique:true })
    email: string

    @Column({ name: 'password' })
    password: string
    

}