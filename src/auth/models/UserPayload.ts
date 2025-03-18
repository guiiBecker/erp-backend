import { Role } from '../enums/role.enum';

export interface UserPayload {
    id?: number;
    name: string;
    username: string;
    role?: Role | string;
    iat?: number;
    exp?: number;
}