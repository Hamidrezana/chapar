import { TodoChapar } from './chapar';

TodoChapar.getTodos().then(response => {
  console.log(response.data?.todos);
});

TodoChapar.getTodo({ id: 1 }).then(response => {
  console.log(response.data?.todo);
});
