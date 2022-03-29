import Chapar from '../src';

describe('Chapar Tests', () => {
  it('Chapar should work correctly', async () => {
    const chapar = new Chapar({ main: 'https://jsonplaceholder.typicode.com' });

    const response = await chapar.sendChapar('todos/1', {
      urlProps: { baseUrlType: 'main' },
    });
    expect(response.success).toEqual(true);
  });
});
