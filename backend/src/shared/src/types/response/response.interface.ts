export interface IResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

interface IMutateResponse {
  id: number;
}

export interface ICreated extends IMutateResponse {}
export interface IUpdated extends IMutateResponse {}
export interface IDeleted extends IMutateResponse {}
