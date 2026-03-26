export interface IBrainSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}
export interface IBrainPageable {
  pageNumber: number;
  pageSize: number;
  sort: IBrainSort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface IBrainResult<T> {
  content: T[];
  pageable: IBrainPageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: IBrainSort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
