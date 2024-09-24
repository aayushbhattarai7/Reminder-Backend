import { BaseEntity, BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { randomUUID } from "crypto";
@Entity()
abstract class Base extends BaseEntity {
    @Column({name:'id',primary:true, type:'uuid'})  
    id: string;

    @CreateDateColumn({ name: 'created-at' })
    createdAt: Date
    
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date
    
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt:string

    @BeforeInsert()
    generateUUID() {
    this.id = randomUUID()
    }
}
export default Base
