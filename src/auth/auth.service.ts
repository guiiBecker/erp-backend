import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor (private readonly userService: UserService){}
    async validateUser(username: string, password: string) {
       const user = await this.userService.findbyUsername(username);
        if (user){
            const passwordValid = await bcrypt.compare(password, user.password);

            if (passwordValid){
                return {
                    ...user, 
                    password:undefined,
                }
            }
        }
        throw new Error ('User or Password are incorrect.')
    }
}
