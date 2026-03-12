export interface CustomerUpdateDto {
  id: number;
  name: string;
  email: string;
  balance: number;
  tcKimlikNo?: string | null;
}
