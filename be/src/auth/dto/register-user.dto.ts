import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'https://i.pravatar.cc/150', required: false })
  @IsOptional()
  avatar?: string;
}
