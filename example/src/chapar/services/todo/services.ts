import { chapar } from '../../core';
import * as DTO from './dto';
import * as EP from './endpoints';
import * as TYPE from './types';

export const getTodos = () => {
  return chapar.sendChapar<TYPE.GetTodosResultType, TYPE.GetTodosResponseType>(EP.GET_TODOS_EP, {
    method: 'get',
    baseUrlType: 'MAIN',
    dto: DTO.getTodosDTO,
  });
};

export const getTodo = (payload: TYPE.GetTodoPayloadType) => {
  return chapar.sendChapar<TYPE.GetTodoResultType, TYPE.GetTodoResponseType>(
    EP.GET_TODO_EP(payload.id),
    {
      method: 'get',
      baseUrlType: 'MAIN',
      dto: DTO.getTodoDTO,
    },
  );
};
