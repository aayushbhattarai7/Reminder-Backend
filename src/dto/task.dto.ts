import { IsNotEmpty } from "class-validator";

export class TaskDTO {
  @IsNotEmpty()
  name: string;

  deadline: Date;
}
