import { Column } from "typeorm";
import Base from "./base.entity";

export class Reminder extends Base {
    @Column({name:'notification'})
    notification: string
    
    
}