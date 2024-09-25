import { Column, Entity } from "typeorm";
import Base from "./base.entity";
import { Role } from "../constant/enum";
@Entity("user")
export class User extends Base {
  @Column({ name: "full_name" })
  name: string;

  @Column({ type: "date" })
  DOB: Date;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: "email", unique: true })
  email: string;

  @Column({ type: "varchar", name: "wish", nullable: true })
  wish: string | null;

  @Column({ name: "password", select: false })
  password: string;
}
