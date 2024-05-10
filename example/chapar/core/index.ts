import Chapar from "@hamidrezana/chapar";
import { BASE_URL } from "../constants";
import { ApiUrlType } from "../types";

export const chapar = new Chapar<Record<ApiUrlType, string>, {}>({
  baseUrl: BASE_URL,
});