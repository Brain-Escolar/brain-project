export interface RequestOptions<TParams = Record<string, unknown>> {
  params?: TParams;
  headers?: Record<string, string>;
}

export interface HttpClient {
  get<TResponse, TParams = Record<string, unknown>>(
    url: string,
    options?: RequestOptions<TParams>,
  ): Promise<TResponse>;

  post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse>;

  put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse>;

  patch<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse>;

  delete<TResponse, TParams = Record<string, unknown>>(
    url: string,
    options?: RequestOptions<TParams>,
  ): Promise<TResponse>;
}
