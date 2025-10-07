import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { MemberModule } from './member/member.module';

@Module({
  imports: [ProductModule, MemberModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
