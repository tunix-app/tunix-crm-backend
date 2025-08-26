import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { UserService } from './services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.userService.updateUser(id, updateData);
  }
}