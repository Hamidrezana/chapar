import { TodoChapar } from './chapar';

TodoChapar.getTodos().then(response => {
  console.log(response.data?.todos);
});
