import { GetTodosResponseType, GetTodosResultType } from "../types";
import { todoTransformer } from '../transformers'

export const getTodosDTO = (response: GetTodosResponseType): GetTodosResultType => {
  return {
    todos: response.map(todoTransformer)
  };
};
