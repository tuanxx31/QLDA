
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const existingUser = await this.usersService.findOneByEmail(
      registerUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    await this.usersService.create({
      ...registerUserDto,
      password: hashedPassword,
      provider: 'local',
    });

    return {
      message: 'Đăng ký thành công',
    };
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findOneByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    if (!user.password) {
      throw new UnauthorizedException('Tài khoản này đăng nhập bằng Google');
    }
    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, email: user.email };
    const userWithoutPassword = _.omit(user, ['password']);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
  }

  async validateGoogleUser(googleUser: any) {
    const { googleId, email, name, avatar } = googleUser;

    if (!email) {
      throw new BadRequestException('Không thể lấy email từ Google');
    }

    // Tìm user theo googleId hoặc email
    let user = await this.usersService.findOneByGoogleId(googleId);
    
    if (!user) {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await this.usersService.findOneByEmail(email);
      
      if (existingUser) {
        // Nếu email đã tồn tại nhưng chưa có googleId, cập nhật
        if (!existingUser.googleId) {
          const updatedUser = await this.usersService.updateGoogleInfo(existingUser.id, {
            googleId,
            provider: 'google',
            avatar: avatar || existingUser.avatar,
            name: name || existingUser.name,
          });
          if (!updatedUser) {
            throw new BadRequestException('Không thể cập nhật thông tin người dùng');
          }
          user = updatedUser;
        } else {
          // Email đã tồn tại và đã có googleId khác
          throw new BadRequestException('Email này đã được liên kết với tài khoản Google khác');
        }
      } else {
        // Tạo user mới từ Google
        user = await this.usersService.create({
          email,
          name: name || email.split('@')[0],
          avatar: avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          googleId,
          provider: 'google',
        });
      }
    } else {
      // User đã tồn tại, cập nhật thông tin nếu có thay đổi
      const updateData: any = {};
      if (avatar && avatar !== user.avatar) {
        updateData.avatar = avatar;
      }
      if (name && name !== user.name) {
        updateData.name = name;
      }
      if (Object.keys(updateData).length > 0) {
        const updatedUser = await this.usersService.updateGoogleInfo(user.id, updateData);
        if (updatedUser) {
          user = updatedUser;
        }
      }
    }

    if (!user) {
      throw new BadRequestException('Không thể tạo hoặc cập nhật người dùng');
    }

    const payload = { sub: user.id, email: user.email };
    const userWithoutPassword = _.omit(user, ['password']);

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: userWithoutPassword,
    };
  }
}
