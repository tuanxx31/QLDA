import { ApiProperty } from '@nestjs/swagger';

export class DeadlineSummaryDto {
  @ApiProperty({ example: 5 })
  overdue: number;

  @ApiProperty({ example: 3 })
  dueSoon: number;

  @ApiProperty({ example: 10 })
  completedOnTime: number;

  @ApiProperty({ example: 2 })
  completedLate: number;
}

