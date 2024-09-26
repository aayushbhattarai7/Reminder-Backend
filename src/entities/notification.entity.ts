import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import Base from "./base.entity";
import { Status } from "../constant/enum";
import { Admin } from "./admin.entity";
import { User } from "./user.entity";
@Entity("notification")
export class Notification extends Base {
  @Column({ name: "notification" })
  notification: string;

  @ManyToOne(() => User, (auth) => auth.notification, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  auth: User;
}
