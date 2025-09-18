import { Observable } from 'rxjs';

export type SelectHandlerParams = {
  pageNumber: number;
  pageCapacity: number;
  search: string | null;
};

export type SelectHandlerOutput<T> = {
  options: T[];
  metadata: {
    pageNumber: number;
    pageCapacity: number;
    total: number;
  };
};

export type SelectHandler<T> = (
  params: SelectHandlerParams
) => Observable<SelectHandlerOutput<T>>;
