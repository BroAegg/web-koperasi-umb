export class CreateMemberDto {
  name: string;
  email: string;
  nomorAnggota: string;
  unitKerja?: string;
  simpananPokok?: number;
  simpananWajib?: number;
  simpananSukarela?: number;
}
