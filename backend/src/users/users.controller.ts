import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUserId() userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUserId() userId: string,
    @Body() updateDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateDto);
  }
}
