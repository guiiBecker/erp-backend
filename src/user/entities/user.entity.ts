import { Token } from "../../token/entities/token.entity";
import { Role } from "../../auth/enums/role.enum";

export class User {
    id?: number;
    name: string;
    username: string;
    password: string;
    role?: Role;
    token: Token[];
}
