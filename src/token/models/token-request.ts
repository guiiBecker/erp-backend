import { Request } from "express";

export interface TokenRequest extends Request {
    user: {
        id: number;
        username: string;
        name: string;
    };
} 