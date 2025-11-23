export interface IPaginationRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface IPagination {
  page: number;
  totalPages: number;
  total: number;
  hasNextPage?: boolean | null;
  hasPrevPage?: boolean | null;
}

export interface IPaginationResult<T> {
  data: T[];
  statusCode?: number;
  message?: string;
  pagination: IPagination;
}
