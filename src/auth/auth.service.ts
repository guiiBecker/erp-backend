import { Injectable, UnauthorizedException } from '@nestjs/common';
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
        const payload: UserPayload = {
            id: user.id,
            name: user.name,
            username: user.username,
        };
        const jwtToken = this.jwtService.sign(payload);

        return {
            access_token: jwtToken
        };
    }

    async validateUser(username: string, password: string) {
        const user = await this.userService.findbyUsername(username);
        
        if (!user) {
            throw new UnauthorizedException('Usuário ou senha incorretos');
        }
        
        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            throw new UnauthorizedException('Usuário ou senha incorretos');
        }
        
        return {
            ...user, 
            password: undefined,
        };
    }
}
