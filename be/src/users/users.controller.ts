import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserProfileDto } from './dto/user-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Lấy thông tin profile của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: any): Promise<UserProfileDto | null> {
    console.log('User from JWT:', req?.user);
    return this.usersService.getProfile(req.user.id as number);
  }
}
