import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Base from "./base.entity";
import { Status } from "../constant/enum";
import { Admin } from "./admin.entity";
import { User } from "./user.entity";
import { Notification } from "./notification.entity";
@Entity("task")
export class Task extends Base {
  @Column({ name: "task_name" })
  name: string;

  @Column({ type: "timestamp" })
  deadline: Date;

  @Column({ type: "enum", enum: Status, default: Status.PENDING })
  status: Status;

  @ManyToOne(() => Admin, (admin) => admin.task, { onDelete: "CASCADE" })
  @JoinColumn({ name: "admin_id" })
  admin: Admin;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => Notification, (notifications) => notifications.task, {
    cascade: true,
  })
  notifications: Notification;
}
