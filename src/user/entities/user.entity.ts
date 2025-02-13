import { Token } from "src/token/entities/token.entity";

export class User {
    id?:number;
    name:string;
    username:string;
    password:string;
    token:Token[];
}
