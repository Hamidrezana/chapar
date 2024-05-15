import { ITodo } from '../../../models/Todo';

export interface TodoResponseType {
  id: number;
  title: string;
  user_id: number;
  is_done: boolean;
}

// * GetTodos
export type GetTodosResponseType = Array<TodoResponseType>;
export type GetTodosResultType = {
  todos: Array<ITodo>;
};
// * GetTodos

// * GetTodo
export type GetTodoPayloadType = {
  id: number;
};
export type GetTodoResponseType = TodoResponseType;
export type GetTodoResultType = {
  todo: ITodo;
};
// * GetTodo
