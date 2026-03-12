export interface Customer {
  id: number;        // .NET int -> TS number
  name: string;      // .NET string -> TS string
  email: string;     // .NET string -> TS string
  balance: number;   // .NET decimal/double -> TS number
  tcKimlikNo?: string | null; // T.C. Kimlik
  createdAt: string; // .NET DateTime -> TS string (ISO Format)
  profileImageId?: string | null; // .NET Guid? -> TS string | null
  profileImagePath?: string | null; // Static file relative path
}
