import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  simpananPokok?: number;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @IsOptional()
  simpananWajib?: number;

  @ApiProperty({ example: 25000, required: false })
  @IsNumber()
  @IsOptional()
  simpananSukarela?: number;
}