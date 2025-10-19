import { Expose } from 'class-transformer';

export class UserProfileDto {
  @Expose() id: number;
  @Expose() name: string;
  @Expose() email: string;
  @Expose() avatar: string;
  @Expose() studentCode: string;
  @Expose() department: string;
  @Expose() createdAt: Date;
}
