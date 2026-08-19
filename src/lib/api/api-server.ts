import axios from "axios";
import { cookies } from "next/headers";

let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
if (API_BASE_URL.startsWith("/")) {
  API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080";
}

export const createServerApi = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  if (token) {
    instance.defaults.headers.Cookie = `admin_token=${token}`;
  }

  return instance;
};
