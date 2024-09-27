import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Base from "./base.entity";
import { User } from "./user.entity";
import { Task } from "./task.entity";
@Entity("notification")
export class Notification extends Base {
  @Column({ name: "notification" })
  notification: string;

  @Column({ default: false })
  notified: boolean;

  @ManyToOne(() => User, (auth) => auth.notification, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  auth: User;

  @ManyToOne(() => Task, (task) => task.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "task_id" })
  task: Task;
}
