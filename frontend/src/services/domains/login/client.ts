import { httpClient } from "@/services/http";
import { LoginRequest } from "./request";
import { LoginResponse } from "./response";

const BASE_ROUTE = "login";

export class LoginAPI {
  login(request: LoginRequest): Promise<LoginResponse> {
    return httpClient.post(`${BASE_ROUTE}`, request, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
