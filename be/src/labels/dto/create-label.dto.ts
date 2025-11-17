import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateLabelDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  projectId: string;
}
