export interface CustomerParams {
  searchTerm?: string;
  sort: string;
  pageIndex: number;
  pageSize: number;
  lastId: number; // If using Cursor
}
