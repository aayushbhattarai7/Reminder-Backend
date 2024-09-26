import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class AdminDTO {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  password: string;
}
