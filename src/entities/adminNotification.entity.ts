import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Base from "./base.entity";
import { Task } from "./task.entity";
import { Admin } from "./admin.entity";
@Entity("admin_notification")
export class AdminNotification extends Base {
  @Column({ name: "content" })
  notification: string;

  @Column({ default: false })
  notified: boolean;

  @ManyToOne(() => Task, (task) => task.tasknoti, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "task_id" })
  task: Task;

  @ManyToOne(() => Admin, (admin) => admin.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "admin_id" })
  admin: Admin;
}
