import { Controller, Get, Patch } from '@nestjs/common';

@Controller('auth')
export class AuthController{
    @Get('/me')
    getUserProfile() {

    }

    @Patch('/me')
    updateUserProfile() {

    }

}