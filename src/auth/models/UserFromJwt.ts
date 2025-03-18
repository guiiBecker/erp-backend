import { Role } from '../enums/role.enum';

export interface UserFromJwt {
    id: number;
    username: string;
    name: string;
    role?: Role | string;
}