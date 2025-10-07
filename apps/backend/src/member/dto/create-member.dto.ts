import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEmail } from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'M001' })
  @IsString()
  memberNumber: string;

  @ApiProperty({ example: '081234567890', required: false })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: 'Jakarta Selatan', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'IT Department' })
  @IsString()
  unitKerja: string;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  simpananPokok: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  simpananWajib: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @IsOptional()
  simpananSukarela?: number;

  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
