import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserPayload } from './models/UserPayload';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
    constructor (
        private readonly userService: UserService, 
        private readonly jwtService: JwtService,){}
     
    login(user: User): UserToken {
        const paylod:UserPayload= {
            id: user.id,
            name: user.name,
            username: user.username,
        } 
        const jwtToken = this.jwtService.sign(paylod)

        return {
            access_token: jwtToken
        }
    }
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
