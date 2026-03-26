import { httpClient } from "@/services/http";
import { LoginGoogleResponse } from "./response";
import { LoginGoogleRequest } from "./request";

const BASE_ROUTE = "login/google";

export class LoginGoogleAPI {
  async loginGoogle(): Promise<void> {
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    window.location.href = `${BASE_URL}${BASE_ROUTE}`;
  }

  loginGoogleAutorizado(request: LoginGoogleRequest): Promise<LoginGoogleResponse> {
    return httpClient.get(`${BASE_ROUTE}/autorizado`, { params: request });
  }
}
