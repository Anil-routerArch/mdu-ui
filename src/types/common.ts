export type ID = string;

export type ISODateTime = string;

export type StatusSeverity = "info" | "success" | "warning" | "critical";

export type SortDirection = "asc" | "desc";

export type Nullable<T> = T | null;

export type Maybe<T> = T | null | undefined;

export interface PaginatedResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type ApiResult<TData, TError = string> =
  | {
      ok: true;
      data: TData;
    }
  | {
      ok: false;
      error: TError;
    };
