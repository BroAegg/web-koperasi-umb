export class CreateProductDto {
  name: string;
  category?: string;
  stock?: number;
  threshold?: number;
  buyingPrice: number;
}
