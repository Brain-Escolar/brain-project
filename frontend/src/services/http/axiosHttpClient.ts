import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { HttpClient, RequestOptions } from "./";

export class AxiosHttpClient implements HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      ...config,
    });

    // Interceptor para adicionar automaticamente o Bearer token em todas as requisições
    this.client.interceptors.request.use(
      (config) => {
        // Não adicionar token para rotas de login
        const isLoginRoute = config.url?.includes("login");

        // Verifica se existe token no localStorage e não é uma rota de login
        if (typeof window !== "undefined" && !isLoginRoute) {
          const token = localStorage.getItem("access_token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  async get<TResponse, TParams = Record<string, unknown>>(
    url: string,
    options?: RequestOptions<TParams>,
  ): Promise<TResponse> {
    try {
      const response = await this.client.get<TResponse>(url, {
        params: options?.params,
        headers: options?.headers,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await this.client.post<TResponse>(url, data, {
        headers: options?.headers,
        params: options?.params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await this.client.put<TResponse>(url, data, {
        headers: options?.headers,
        params: options?.params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<TRequest, TResponse>(
    url: string,
    data?: TRequest,
    options?: RequestOptions,
  ): Promise<TResponse> {
    try {
      const response = await this.client.patch<TResponse>(url, data, {
        headers: options?.headers,
        params: options?.params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<TResponse, TParams = Record<string, unknown>>(
    url: string,
    options?: RequestOptions<TParams>,
  ): Promise<TResponse> {
    try {
      const response = await this.client.delete<TResponse>(url, {
        headers: options?.headers,
        params: options?.params,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.statusText || error.message;
      return new Error(`HTTP Error: ${message}`);
    }

    return new Error("Unexpected error");
  }
}
