import {
  GetTodoResponseType,
  GetTodoResultType,
  GetTodosResponseType,
  GetTodosResultType,
} from './types';
import { todoTransformer } from './transformers';

export const getTodosDTO = (response: GetTodosResponseType): GetTodosResultType => {
  return {
    todos: response.map(todoTransformer),
  };
};

export const getTodoDTO = (response: GetTodoResponseType): GetTodoResultType => {
  return {
    todo: todoTransformer(response),
  };
};
