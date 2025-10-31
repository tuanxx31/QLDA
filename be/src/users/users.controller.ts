import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    return this.usersService.getProfile(req.user.sub as string);
  }

  @Put('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật thông tin profile của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateUserDto,
  ): Promise<{ message: string }> {
    return await this.usersService.updateProfile(req.user.sub as string, dto);
  }

  @Put('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Cập nhật mật khẩu của user hiện tại' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePassword(
    @Request() req: any,
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    return await this.usersService.updatePassword(req.user.sub as string, dto);
  }

  @Delete('delete')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Xóa user hiện tại' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteUser(@Request() req: any): Promise<{ message: string }> {
    return await this.usersService.remove(req.user.sub as string);
  }
}
