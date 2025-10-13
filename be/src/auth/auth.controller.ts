import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@ApiTags('Auth') // group trong Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Email đã tồn tại' })
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập, trả về JWT token' })
  @ApiResponse({ status: 200, description: 'Login success' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }
}
