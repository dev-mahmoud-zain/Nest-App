import { Socket } from 'socket.io';
import { IUser } from '../database-models/user.interface';
import { JwtPayload } from 'jsonwebtoken';

export interface ISocket extends Socket{
    credentials?:{
        user:IUser,
        decoded:JwtPayload
    }
}