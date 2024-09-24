import { IsNotEmpty, IsStrongPassword } from "class-validator";

export class UserDTO {
    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    DOB: Date
    
    @IsNotEmpty()
    email: string
    
    @IsStrongPassword()
    password:string
    
}