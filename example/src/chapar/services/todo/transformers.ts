import { ITodo } from '../../../models/Todo';
import { TodoResponseType } from './types';

export const todoTransformer = (response: TodoResponseType): ITodo => {
  return {
    id: response.id,
    title: response.title,
    userId: response.user_id,
    completed: response.is_done,
  };
};
